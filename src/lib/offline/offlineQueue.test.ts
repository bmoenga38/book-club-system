import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock idb since IndexedDB is not available in jsdom
const mockStore = new Map<string, any>();

vi.mock("idb", () => ({
  openDB: vi.fn().mockResolvedValue({
    put: vi.fn((store: string, value: any) => {
      mockStore.set(value.id, value);
      return Promise.resolve();
    }),
    get: vi.fn((store: string, key: string) => {
      return Promise.resolve(mockStore.get(key));
    }),
    getAll: vi.fn(() => {
      return Promise.resolve(Array.from(mockStore.values()));
    }),
    delete: vi.fn((store: string, key: string) => {
      mockStore.delete(key);
      return Promise.resolve();
    }),
  }),
}));

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn().mockReturnValue("test-uuid-1234"),
});

import {
  enqueueAction,
  getPendingActions,
  markSynced,
  clearSyncedActions,
  getQueueCount,
} from "./offlineQueue";

describe("offlineQueue", () => {
  beforeEach(() => {
    mockStore.clear();
    vi.clearAllMocks();
  });

  describe("enqueueAction", () => {
    it("creates a queued action with UUID and timestamp", async () => {
      const id = await enqueueAction({
        type: "borrow_request",
        payload: {
          bookId: "book-1",
          memberId: "user-1",
          churchId: "church-1",
        },
      });

      expect(id).toBe("test-uuid-1234");
      expect(mockStore.size).toBe(1);

      const stored = mockStore.get("test-uuid-1234");
      expect(stored.type).toBe("borrow_request");
      expect(stored.synced).toBe(false);
      expect(stored.createdAt).toBeGreaterThan(0);
      expect(stored.payload.bookId).toBe("book-1");
    });
  });

  describe("getPendingActions", () => {
    it("returns only unsynced actions", async () => {
      mockStore.set("a", { id: "a", synced: false, type: "borrow_request" });
      mockStore.set("b", { id: "b", synced: true, type: "borrow_request" });
      mockStore.set("c", { id: "c", synced: false, type: "borrow_request" });

      const pending = await getPendingActions();
      expect(pending).toHaveLength(2);
      expect(pending.map((p: any) => p.id)).toEqual(["a", "c"]);
    });

    it("returns empty array when all synced", async () => {
      mockStore.set("a", { id: "a", synced: true });

      const pending = await getPendingActions();
      expect(pending).toHaveLength(0);
    });
  });

  describe("markSynced", () => {
    it("marks an action as synced", async () => {
      mockStore.set("a", { id: "a", synced: false });

      await markSynced("a");

      const stored = mockStore.get("a");
      expect(stored.synced).toBe(true);
    });
  });

  describe("clearSyncedActions", () => {
    it("removes only synced actions", async () => {
      mockStore.set("a", { id: "a", synced: true });
      mockStore.set("b", { id: "b", synced: false });
      mockStore.set("c", { id: "c", synced: true });

      await clearSyncedActions();

      expect(mockStore.size).toBe(1);
      expect(mockStore.has("b")).toBe(true);
    });
  });

  describe("getQueueCount", () => {
    it("returns count of pending actions", async () => {
      mockStore.set("a", { id: "a", synced: false });
      mockStore.set("b", { id: "b", synced: true });
      mockStore.set("c", { id: "c", synced: false });

      const count = await getQueueCount();
      expect(count).toBe(2);
    });

    it("returns 0 when queue is empty", async () => {
      const count = await getQueueCount();
      expect(count).toBe(0);
    });
  });
});
