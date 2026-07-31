import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? randomBytes(32).toString("hex"),
);
const JWT_ALG = "HS256";
const TOKEN_EXPIRY = "7d";

// ─── Password Hashing (scrypt-based) ──────────────────────────────────────────

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLEL = 1;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) => {
    const { scrypt } = require("crypto");
    scrypt(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLEL }, (err: Error, derivedKey: Buffer) => {
      if (err) reject(err);
      resolve(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  return new Promise((resolve, reject) => {
    const { scrypt } = require("crypto");
    scrypt(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLEL }, (err: Error, derivedKey: Buffer) => {
      if (err) reject(err);
      try {
        resolve(timingSafeEqual(derivedKey, expected));
      } catch {
        resolve(false);
      }
    });
  });
}

// ─── JWT Token ────────────────────────────────────────────────────────────────

export interface TokenPayload {
  sub: string;   // user UUID
  email: string;
  name: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: [JWT_ALG] });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Input Validation ─────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN = 8;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) return "Invalid email address";
  if (trimmed.length > 254) return "Email too long";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (trimmed.length > 100) return "Name too long";
  if (/[<>\"'&]/.test(trimmed)) return "Name contains invalid characters";
  return null;
}

// ─── URL Validation for Download Proxy ────────────────────────────────────────

const ALLOWED_DOWNLOAD_PROTOCOLS = ["https:", "http:"];
const MAX_URL_LENGTH = 2048;

export function validateDownloadUrl(raw: string): { error: string | null; url: URL | null } {
  if (!raw || raw.length > MAX_URL_LENGTH || raw.length < 10) {
    return { error: "Invalid URL", url: null };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { error: "Malformed URL", url: null };
  }

  if (!ALLOWED_DOWNLOAD_PROTOCOLS.includes(parsed.protocol)) {
    return { error: "Only HTTP(S) URLs allowed", url: null };
  }

  // Block private/internal IPs (SSRF prevention)
  const hostname = parsed.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("172.16.") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return { error: "Internal URLs not allowed", url: null };
  }

  return { error: null, url: parsed };
}

// ─── Extract Filename from URL ───────────────────────────────────────────────

export function extractFilename(url: URL): string {
  const pathname = url.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "download";
  const decoded = decodeURIComponent(lastSegment);

  // Ensure it has an extension or default to generic name
  if (decoded.includes(".") && decoded.length < 200) {
    return decoded;
  }

  // Try to derive from host + path hash
  const hostSlug = url.hostname.replace(/^www\./, "").split(".")[0];
  const hash = createHash("md5").update(url.pathname).digest("hex").slice(0, 8);
  return `${hostSlug}-${hash}.pdf`;
}
