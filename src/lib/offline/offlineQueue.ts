"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "bookclub-offline";
const STORE_NAME = "request-queue";
const DB_VERSION = 1;

export interface QueuedAction {
  id: string; // UUID v4 idempotency key
  type: "borrow_request";
  payload: {
    bookId: string;
    memberId: string;
    churchId: string;
  };
  createdAt: number;
  synced: boolean;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export async function enqueueAction(action: Omit<QueuedAction, "id" | "createdAt" | "synced">) {
  const db = await getDb();
  const id = crypto.randomUUID();
  const entry: QueuedAction = {
    id,
    ...action,
    createdAt: Date.now(),
    synced: false,
  };
  await db.put(STORE_NAME, entry);
  return id;
}

export async function getPendingActions(): Promise<QueuedAction[]> {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  return (all as QueuedAction[]).filter((a) => !a.synced);
}

export async function markSynced(id: string) {
  const db = await getDb();
  const action = await db.get(STORE_NAME, id);
  if (action) {
    action.synced = true;
    await db.put(STORE_NAME, action);
  }
}

export async function clearSyncedActions() {
  const db = await getDb();
  const all = await db.getAll(STORE_NAME);
  for (const action of all) {
    if ((action as QueuedAction).synced) {
      await db.delete(STORE_NAME, (action as QueuedAction).id);
    }
  }
}

export async function getQueueCount(): Promise<number> {
  const pending = await getPendingActions();
  return pending.length;
}
