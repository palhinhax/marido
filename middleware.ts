import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = nextUrl;

  // /registar/profissional is reachable while logged in (a client can upgrade
  // to a professional account there), so it is NOT treated as an auth route.
  const isAuthRoute =
    pathname.startsWith("/login") ||
    (pathname.startsWith("/registar") &&
      !pathname.startsWith("/registar/profissional"));

  // Route groups that require authentication
  const clientArea = pathname.startsWith("/dashboard");
  const proArea =
    pathname.startsWith("/profissional") &&
    pathname !== "/profissional/registar";
  const adminArea = pathname.startsWith("/admin");
  const isProtected = clientArea || proArea || adminArea;

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role gating
  if (adminArea && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (proArea && role && role !== "PROFESSIONAL" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    const dest =
      role === "ADMIN"
        ? "/admin"
        : role === "PROFESSIONAL"
          ? "/profissional"
          : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
