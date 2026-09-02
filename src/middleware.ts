import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "ostan_super_secure_jwt_session_secret_key_2026_xyz123!"
);

const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/firebase-session",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, public routes, and api auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ostan_session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (!payload?.userId) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
