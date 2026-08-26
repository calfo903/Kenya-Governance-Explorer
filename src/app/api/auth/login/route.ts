import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { verifyPassword, validateEmail, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "email and password are required" }, { status: 400 });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });

    const response = NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
        token,
      },
      { status: 200 },
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
