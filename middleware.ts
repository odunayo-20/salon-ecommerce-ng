import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL(token.role === "ADMIN" ? "/admin" : "/dashboard", request.url));
  }

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isAdmin && !token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isAdmin && token && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
};
