import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes, timingSafeEqual, scrypt as scryptCb } from "crypto";

// ─── Constants ────────────────────────────────────────────────────────────────

const _rawSecret = process.env.JWT_SECRET;
if (!_rawSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('[AUTH] FATAL: JWT_SECRET environment variable is required in production. Refusing to start.');
  }
  console.warn('[AUTH] WARNING: Using insecure fallback JWT secret. Set JWT_SECRET for production.');
}
const JWT_SECRET = new TextEncoder().encode(
  _rawSecret ?? 'dev-only-insecure-fallback-do-not-use-in-prod',
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
  const derivedKey: Buffer = await new Promise((resolve, reject) => {
    scryptCb(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLEL }, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
  return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derivedKey: Buffer = await new Promise((resolve, reject) => {
    scryptCb(password, salt, SCRYPT_KEYLEN, { N: SCRYPT_COST, r: SCRYPT_BLOCK_SIZE, p: SCRYPT_PARALLEL }, (err, derived) => {
      if (err) reject(err);
      else resolve(derived as Buffer);
    });
  });
  try {
    return timingSafeEqual(derivedKey, expected);
  } catch {
    return false;
  }
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

  // Block private/internal IPs (SSRF prevention) — full RFC 1918 + link-local + CGNAT
  const hostname = parsed.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".test") ||
    hostname.endsWith(".example") ||
    hostname.endsWith(".invalid")
  ) {
    return { error: "Internal URLs not allowed", url: null };
  }

  // Parse numeric IPs for range checks
  const ipMatch = hostname.match(/^(d{1,3}).(d{1,3}).(d{1,3}).(d{1,3})$/);
  if (ipMatch) {
    const octets = ipMatch.slice(1).map(Number);
    const first = octets[0];
    const second = octets[1];
    // 10.0.0.0/8
    if (first === 10) return { error: "Internal URLs not allowed", url: null };
    // 172.16.0.0/12 (172.16.x.x through 172.31.x.x)
    if (first === 172 && second >= 16 && second <= 31) return { error: "Internal URLs not allowed", url: null };
    // 192.168.0.0/16
    if (first === 192 && second === 168) return { error: "Internal URLs not allowed", url: null };
    // 169.254.0.0/16 (link-local)
    if (first === 169 && second === 254) return { error: "Internal URLs not allowed", url: null };
    // 100.64.0.0/10 (CGNAT)
    if (first === 100 && second >= 64 && second <= 127) return { error: "Internal URLs not allowed", url: null };
    // 198.18.0.0/15 (benchmark)
    if (first === 198 && second >= 18 && second <= 19) return { error: "Internal URLs not allowed", url: null };
    // 0.0.0.0/8, 127.0.0.0/8 (redundant but explicit)
    if (first === 0 || first === 127) return { error: "Internal URLs not allowed", url: null };
  }

  // Block IPv6 private ranges (simplified)
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    const ipv6 = hostname.slice(1, -1);
    if (ipv6 === '::1' || ipv6.startsWith('fe80:') || ipv6.startsWith('fc') || ipv6.startsWith('fd')) {
      return { error: "Internal URLs not allowed", url: null };
    }
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
