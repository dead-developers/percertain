import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Edge-safe auth gate: only check for the presence of the NextAuth session
  // cookie. Real session validation happens server-side (API routes / server
  // components via getCurrentUser), because database-strategy sessions and
  // Prisma cannot run in the Edge runtime.
  const hasSession = Boolean(
    request.cookies.get("next-auth.session-token")?.value ??
      request.cookies.get("__Secure-next-auth.session-token")?.value
  );
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/api/auth",
    "/gallery"
  ];

  // Check if the path starts with any of the public paths
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If authenticated and trying to access auth pages, redirect to projects
  if (hasSession && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // If not authenticated and trying to access protected routes, redirect to signin
  if (!hasSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}
