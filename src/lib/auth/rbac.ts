// No "server-only" guard — this module is imported by edge middleware.
// Contains no secrets or DB access; only pure role/route logic.
import { UserRole } from "@/types/auth";

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.MEMBER]: 0,
  [UserRole.ASSISTANT_LIBRARIAN]: 1,
  [UserRole.CHURCH_ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

// Route patterns and their minimum required role
// Matched top-down — first match wins
const ROUTE_PERMISSIONS: { pattern: RegExp; minRole: UserRole }[] = [
  // Super Admin only
  { pattern: /^\/(app\/)?admin\/churches/, minRole: UserRole.SUPER_ADMIN },
  { pattern: /^\/(app\/)?admin\/roles/, minRole: UserRole.SUPER_ADMIN },

  // Church Admin (Evangelist) and above
  { pattern: /^\/(app\/)?admin\/members/, minRole: UserRole.CHURCH_ADMIN },
  { pattern: /^\/(app\/)?admin\/dashboard/, minRole: UserRole.CHURCH_ADMIN },
  { pattern: /^\/(app\/)?admin/, minRole: UserRole.CHURCH_ADMIN },

  // All authenticated users (Member and above)
  { pattern: /^\/(app\/)?/, minRole: UserRole.MEMBER },
];

// Routes that don't require authentication
const PUBLIC_PATTERNS: RegExp[] = [
  /^\/login/,
  /^\/verify/,
  /^\/api\/auth/,
  /^\/$/, // Landing page
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function hasRouteAccess(role: UserRole, pathname: string): boolean {
  // Public routes are always accessible
  if (isPublicRoute(pathname)) return true;

  const match = ROUTE_PERMISSIONS.find((rp) => rp.pattern.test(pathname));
  if (!match) return true; // No restriction defined — allow by default

  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[match.minRole];
}
