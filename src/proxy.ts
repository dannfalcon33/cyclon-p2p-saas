import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy Convention (replaces deprecated middleware)
 * Fast-redirect for unauthorized URL navigation to protected areas.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Comprobar presencia de la cookie de sesión de Better Auth
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = Boolean(sessionCookie?.value);

  // 1. Protección de rutas privadas del Comerciante (/app/*)
  if (pathname.startsWith("/app")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protección de rutas administrativas del Propietario Master (/master/*)
  if (pathname.startsWith("/master")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Redirección amigable si un usuario con sesión activa intenta ir a /login o /registro
  if (pathname === "/login" || pathname === "/registro") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/master/:path*",
    "/login",
    "/registro",
  ],
};
