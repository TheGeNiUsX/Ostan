import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

const COOKIE_NAME = "ostan_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ostan_super_secure_jwt_session_secret_key_2026_xyz123!"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  isSuperAdmin: boolean;
  name: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        department: true,
        userPermissions: {
          include: { permission: true },
        },
      },
    });

    if (!user || user.status === "SUSPENDED" || user.status === "TERMINATED") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
