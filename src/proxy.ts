import { auth } from "@/lib/auth/config";
import { isPublicRoute, hasRouteAccess } from "@/lib/auth/rbac";
import type { UserRole, UserStatus } from "@/types/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  if (isPublicRoute(pathname)) return;

  // No session — redirect to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  const userStatus = (req.auth.user as { status?: UserStatus }).status;
  const userRole = req.auth.user.role as UserRole;

  // Suspended users — redirect to login with error
  if (userStatus === "suspended") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "suspended");
    return Response.redirect(loginUrl);
  }

  // Pending verification — only allow /pending-verification and /profile
  if (userStatus === "pending_verification") {
    if (pathname !== "/pending-verification" && pathname !== "/profile") {
      return Response.redirect(new URL("/pending-verification", req.url));
    }
    return;
  }

  // RBAC check — verify role has access to this route
  if (!hasRouteAccess(userRole, pathname)) {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|monitoring|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
