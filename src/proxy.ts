import { auth } from "@/lib/auth/config";
import { isPublicRoute, hasRouteAccess } from "@/lib/auth/rbac";
import type { UserRole } from "@/types/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  if (isPublicRoute(pathname)) return;

  // No session — redirect to login
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return Response.redirect(loginUrl);
  }

  // RBAC check — verify role has access to this route
  const userRole = req.auth.user.role as UserRole;
  if (!hasRouteAccess(userRole, pathname)) {
    const notFoundUrl = new URL("/not-found", req.url);
    return Response.redirect(notFoundUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
