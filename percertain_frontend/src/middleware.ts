import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const session = await getSession();
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
  if (session && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // If not authenticated and trying to access protected routes, redirect to signin
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}
