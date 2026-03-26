import { describe, it, expect, vi } from "vitest";

// Mock next-auth modules before any imports that trigger them
vi.mock("next-auth", () => ({ default: vi.fn() }));
vi.mock("next-auth/jwt", () => ({}));

import { UserRole } from "@/types/auth";
import { isPublicRoute, hasRouteAccess } from "./rbac";

describe("isPublicRoute", () => {
  it("marks /login as public", () => {
    expect(isPublicRoute("/login")).toBe(true);
  });

  it("marks /verify as public", () => {
    expect(isPublicRoute("/verify")).toBe(true);
  });

  it("marks /api/auth routes as public", () => {
    expect(isPublicRoute("/api/auth/session")).toBe(true);
    expect(isPublicRoute("/api/auth/csrf")).toBe(true);
    expect(isPublicRoute("/api/auth/callback/credentials")).toBe(true);
  });

  it("marks landing page as public", () => {
    expect(isPublicRoute("/")).toBe(true);
  });

  it("marks app routes as NOT public", () => {
    expect(isPublicRoute("/books")).toBe(false);
    expect(isPublicRoute("/admin/dashboard")).toBe(false);
    expect(isPublicRoute("/profile")).toBe(false);
    expect(isPublicRoute("/borrowings")).toBe(false);
  });
});

describe("hasRouteAccess", () => {
  describe("member role", () => {
    const role = UserRole.MEMBER;

    it("can access general app routes", () => {
      expect(hasRouteAccess(role, "/books")).toBe(true);
      expect(hasRouteAccess(role, "/profile")).toBe(true);
      expect(hasRouteAccess(role, "/borrowings")).toBe(true);
      expect(hasRouteAccess(role, "/books/some-id")).toBe(true);
    });

    it("cannot access admin routes", () => {
      expect(hasRouteAccess(role, "/admin")).toBe(false);
      expect(hasRouteAccess(role, "/admin/dashboard")).toBe(false);
      expect(hasRouteAccess(role, "/admin/members")).toBe(false);
      expect(hasRouteAccess(role, "/admin/issue")).toBe(false);
      expect(hasRouteAccess(role, "/admin/returns")).toBe(false);
      expect(hasRouteAccess(role, "/admin/books/new")).toBe(false);
    });

    it("cannot access super admin routes", () => {
      expect(hasRouteAccess(role, "/admin/churches")).toBe(false);
      expect(hasRouteAccess(role, "/admin/roles")).toBe(false);
    });
  });

  describe("assistant_librarian role", () => {
    const role = UserRole.ASSISTANT_LIBRARIAN;

    it("can access general app routes", () => {
      expect(hasRouteAccess(role, "/books")).toBe(true);
      expect(hasRouteAccess(role, "/profile")).toBe(true);
      expect(hasRouteAccess(role, "/borrowings")).toBe(true);
    });

    it("can access issue, returns, and book management", () => {
      expect(hasRouteAccess(role, "/admin/issue")).toBe(true);
      expect(hasRouteAccess(role, "/admin/returns")).toBe(true);
      expect(hasRouteAccess(role, "/admin/books/new")).toBe(true);
      expect(hasRouteAccess(role, "/admin")).toBe(true);
    });

    it("cannot access church admin routes", () => {
      expect(hasRouteAccess(role, "/admin/members")).toBe(false);
      expect(hasRouteAccess(role, "/admin/dashboard")).toBe(false);
    });

    it("cannot access super admin routes", () => {
      expect(hasRouteAccess(role, "/admin/churches")).toBe(false);
      expect(hasRouteAccess(role, "/admin/roles")).toBe(false);
    });
  });

  describe("church_admin role", () => {
    const role = UserRole.CHURCH_ADMIN;

    it("can access general app routes", () => {
      expect(hasRouteAccess(role, "/books")).toBe(true);
    });

    it("can access admin routes", () => {
      expect(hasRouteAccess(role, "/admin")).toBe(true);
      expect(hasRouteAccess(role, "/admin/dashboard")).toBe(true);
      expect(hasRouteAccess(role, "/admin/members")).toBe(true);
      expect(hasRouteAccess(role, "/admin/issue")).toBe(true);
      expect(hasRouteAccess(role, "/admin/returns")).toBe(true);
      expect(hasRouteAccess(role, "/admin/books/new")).toBe(true);
      expect(hasRouteAccess(role, "/admin/reports")).toBe(true);
    });

    it("cannot access super admin routes", () => {
      expect(hasRouteAccess(role, "/admin/churches")).toBe(false);
      expect(hasRouteAccess(role, "/admin/roles")).toBe(false);
    });
  });

  describe("super_admin role", () => {
    const role = UserRole.SUPER_ADMIN;

    it("can access all routes", () => {
      expect(hasRouteAccess(role, "/books")).toBe(true);
      expect(hasRouteAccess(role, "/admin")).toBe(true);
      expect(hasRouteAccess(role, "/admin/dashboard")).toBe(true);
      expect(hasRouteAccess(role, "/admin/members")).toBe(true);
      expect(hasRouteAccess(role, "/admin/churches")).toBe(true);
      expect(hasRouteAccess(role, "/admin/roles")).toBe(true);
      expect(hasRouteAccess(role, "/admin/issue")).toBe(true);
      expect(hasRouteAccess(role, "/admin/returns")).toBe(true);
      expect(hasRouteAccess(role, "/admin/reports")).toBe(true);
    });
  });

  describe("public routes", () => {
    it("allows any role to access public routes", () => {
      expect(hasRouteAccess(UserRole.MEMBER, "/login")).toBe(true);
      expect(hasRouteAccess(UserRole.MEMBER, "/api/auth/session")).toBe(true);
      expect(hasRouteAccess(UserRole.MEMBER, "/")).toBe(true);
    });
  });
});
