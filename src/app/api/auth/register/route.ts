import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { hashPassword, validateEmail, validatePassword, validateName, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password, name } = body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      return NextResponse.json({ error: "email, password, and name are required" }, { status: 400 });
    }

    const emailErr = validateEmail(email);
    if (emailErr) return NextResponse.json({ error: emailErr }, { status: 400 });

    const nameErr = validateName(name);
    if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

    const passErr = validatePassword(password);
    if (passErr) return NextResponse.json({ error: passErr }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const token = await signToken({ sub: user.id, email: user.email, name: user.name });

    const response = NextResponse.json(
      { user, token },
      { status: 201 },
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
