import type { StoredBook } from "@/lib/types/books";

export const BOOKS_STORAGE_KEY = "avatarNarradorBooks";

export const LAST_BOOK_KEY =
  "avatarNarrador:lastBookSlug";

export function slugifyBookName(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80) || "lector"
  );
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function loadLocalBooks(): StoredBook[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(
      BOOKS_STORAGE_KEY,
    );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveLocalBooks(
  books: StoredBook[],
) {
  window.localStorage.setItem(
    BOOKS_STORAGE_KEY,
    JSON.stringify(books),
  );

  window.dispatchEvent(
    new Event("avatarNarradorBooksUpdated"),
  );
}

export function setLatestBookSlug(
  slug: string,
) {
  window.localStorage.setItem(
    LAST_BOOK_KEY,
    slug,
  );

  window.dispatchEvent(
    new Event("avatarNarradorBooksUpdated"),
  );
}