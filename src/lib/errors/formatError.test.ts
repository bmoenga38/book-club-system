import { describe, it, expect } from "vitest";
import { formatError } from "./formatError";

describe("formatError", () => {
  describe("Stack trace stripping", () => {
    it("strips multi-line stack traces", () => {
      const raw = `Member has overdue books
    at handler (convex/borrowings.ts:347:11)
    at executeFunction (...)`;
      expect(formatError(raw)).toBe("Member has overdue books.");
    });

    it("strips inline 'at' frames", () => {
      const raw = "Book is no longer available at handler (foo.ts:1:1)";
      expect(formatError(raw)).toMatch(/^Book is no longer available/);
    });
  });

  describe("Convex prefix stripping", () => {
    it("removes [CONVEX M(...)] prefix", () => {
      const raw = "[CONVEX M(borrowings:request)] Member has overdue books";
      expect(formatError(raw)).toBe("Member has overdue books.");
    });

    it("removes [CONVEX Q(...)] prefix", () => {
      const raw = "[CONVEX Q(users:getProfile)] User not found";
      expect(formatError(raw)).toBe("User not found.");
    });

    it("removes [Request ID: ...] markers", () => {
      const raw = "[Request ID: abc123def456] Something happened";
      expect(formatError(raw)).toBe("Something happened.");
    });

    it("removes 'Server Error' prefix", () => {
      const raw = "Server Error: Failed to load profile";
      expect(formatError(raw)).toBe("Failed to load profile.");
    });

    it("removes 'Uncaught Error:' prefix", () => {
      const raw = "Uncaught Error: Validation failed";
      expect(formatError(raw)).toBe("Validation failed.");
    });

    it("removes 'ConvexError:' prefix", () => {
      const raw = "ConvexError: Phone number already registered";
      expect(formatError(raw)).toBe("Phone number already registered.");
    });

    it("strips multiple noise prefixes from one message", () => {
      const raw = "[CONVEX M(borrowings:request)] [Request ID: 10f5d9f8] Server Error: ConvexError: Member has overdue books";
      expect(formatError(raw)).toBe("Member has overdue books.");
    });
  });

  describe("Network detection", () => {
    it("detects 'Failed to fetch'", () => {
      expect(formatError("Failed to fetch")).toBe("Connection lost. Check your internet and try again.");
    });

    it("detects 'NetworkError'", () => {
      expect(formatError("NetworkError when attempting to fetch resource")).toBe("Connection lost. Check your internet and try again.");
    });

    it("detects 'timeout'", () => {
      expect(formatError("Request timeout")).toBe("Connection lost. Check your internet and try again.");
    });

    it("detects 'ECONNREFUSED'", () => {
      expect(formatError("Error: ECONNREFUSED 127.0.0.1:3000")).toBe("Connection lost. Check your internet and try again.");
    });

    it("detects 'aborted'", () => {
      expect(formatError("The operation was aborted")).toBe("Connection lost. Check your internet and try again.");
    });
  });

  describe("Real-world examples", () => {
    it("cleans the user's exact reported error", () => {
      const raw = `[CONVEX Q(users:getProfile)] [Request ID: 10f5d9f8a27aec2f] Server Error
Could not find public function for 'users:getProfile'. Did you forget to run \`npx convex dev\` or \`npx convex deploy\`?

  Called by client


    at ProfileClient (src/components/domain/ProfileClient.tsx:24:27)`;
      const result = formatError(raw);
      expect(result).not.toContain("CONVEX");
      expect(result).not.toContain("Request ID");
      expect(result).not.toContain("ProfileClient");
      expect(result).not.toContain("at ");
      expect(result).toMatch(/Could not find public function/);
    });

    it("handles plain Error instances", () => {
      const err = new Error("This book is currently unavailable");
      expect(formatError(err)).toBe("This book is currently unavailable.");
    });

    it("handles undefined/null", () => {
      expect(formatError(undefined)).toBe("Something went wrong. Please try again.");
      expect(formatError(null)).toBe("Something went wrong. Please try again.");
    });

    it("uses custom fallback when message is pure noise", () => {
      expect(formatError("Server Error", "Couldn't load books")).toBe("Couldn't load books");
    });

    it("uses fallback for empty strings", () => {
      expect(formatError("")).toBe("Something went wrong. Please try again.");
    });

    it("handles non-string objects", () => {
      expect(formatError({})).toBe("Something went wrong. Please try again.");
      expect(formatError(123)).toBe("Something went wrong. Please try again.");
    });
  });

  describe("Formatting niceties", () => {
    it("capitalizes first letter", () => {
      expect(formatError("phone number is required")).toBe("Phone number is required.");
    });

    it("does not double-capitalize already capitalized text", () => {
      expect(formatError("Phone number is required")).toBe("Phone number is required.");
    });

    it("adds period if missing", () => {
      expect(formatError("Invalid OTP")).toBe("Invalid OTP.");
    });

    it("preserves existing punctuation", () => {
      expect(formatError("Are you sure?")).toBe("Are you sure?");
      expect(formatError("Operation succeeded!")).toBe("Operation succeeded!");
    });

    it("truncates very long messages", () => {
      const long = "A".repeat(300);
      const result = formatError(long);
      expect(result.length).toBeLessThanOrEqual(201);
      expect(result.endsWith("…")).toBe(true);
    });

    it("collapses excessive whitespace", () => {
      expect(formatError("Too    many   spaces\n\nhere")).toBe("Too many spaces here.");
    });
  });

  describe("Business error messages stay intact", () => {
    it("keeps borrowing limit message", () => {
      expect(formatError("You can borrow up to 3 books at a time. Return a book to borrow another.")).toBe(
        "You can borrow up to 3 books at a time. Return a book to borrow another."
      );
    });

    it("keeps overdue block message", () => {
      expect(formatError("Member has overdue books")).toBe("Member has overdue books.");
    });

    it("keeps already-pending message", () => {
      expect(formatError("You already have a pending request for this book")).toBe(
        "You already have a pending request for this book."
      );
    });
  });
});
