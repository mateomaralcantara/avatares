export type BookSource = "local" | "supabase";

export type StoredBook = {
  id: string;
  slug: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;

  source: BookSource;

  textContent?: string;
  dataUrl?: string;

  storagePath?: string;
};

export type NarrationJobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed";