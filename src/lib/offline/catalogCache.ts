"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "bookclub-catalog";
const BOOKS_STORE = "books";
const META_STORE = "meta";
const DB_VERSION = 1;

export interface CachedBook {
  _id: string;
  title: string;
  author: string;
  category?: string;
  description?: string;
  isbn?: string;
  publisher?: string;
  totalCopies: number;
  availableCopies: number;
  churchId: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(BOOKS_STORE)) {
          const store = db.createObjectStore(BOOKS_STORE, { keyPath: "_id" });
          store.createIndex("by_church", "churchId");
          store.createIndex("by_category", "category");
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

/** Cache a full list of books (replaces existing cache for that church) */
export async function cacheBooks(books: CachedBook[], churchId: string) {
  const db = await getDb();
  const tx = db.transaction([BOOKS_STORE, META_STORE], "readwrite");
  const bookStore = tx.objectStore(BOOKS_STORE);
  const metaStore = tx.objectStore(META_STORE);

  // Clear old books for this church
  const index = bookStore.index("by_church");
  let cursor = await index.openCursor(churchId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Insert new books
  for (const book of books) {
    await bookStore.put(book);
  }

  // Update cache timestamp
  await metaStore.put({ key: `lastSync_${churchId}`, value: Date.now() });

  await tx.done;
}

/** Get cached books for a church, optionally filtered */
export async function getCachedBooks(
  churchId: string,
  options?: { search?: string; category?: string }
): Promise<CachedBook[]> {
  const db = await getDb();
  const index = db.transaction(BOOKS_STORE).objectStore(BOOKS_STORE).index("by_church");
  let books = (await index.getAll(churchId)) as CachedBook[];

  if (options?.category) {
    books = books.filter((b) => b.category === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    books = books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
    );
  }

  return books.sort((a, b) => a.title.localeCompare(b.title));
}

/** Get cached categories for a church */
export async function getCachedCategories(churchId: string): Promise<string[]> {
  const books = await getCachedBooks(churchId);
  const cats = new Set<string>();
  for (const b of books) {
    if (b.category) cats.add(b.category);
  }
  return Array.from(cats).sort();
}

/** Check when catalog was last cached */
export async function getLastSyncTime(churchId: string): Promise<number | null> {
  const db = await getDb();
  const meta = await db.get(META_STORE, `lastSync_${churchId}`);
  return meta?.value ?? null;
}

/** Check if cache exists and is fresh (under maxAge ms, default 1 hour) */
export async function isCacheFresh(churchId: string, maxAgeMs = 3600000): Promise<boolean> {
  const lastSync = await getLastSyncTime(churchId);
  if (!lastSync) return false;
  return Date.now() - lastSync < maxAgeMs;
}
