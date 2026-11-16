"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";

import type {
  StoredBook,
} from "@/lib/types/books";

import {
  formatFileSize,
  loadLocalBooks,
  saveLocalBooks,
  setLatestBookSlug,
  slugifyBookName,
} from "@/lib/books/utils";

const MAX_LOCAL_FILE_SIZE =
  4 * 1024 * 1024;

function createId() {
  return crypto.randomUUID();
}

function readAsText(
  file: File,
) {
  return new Promise<string>(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          String(reader.result || ""),
        );

      reader.onerror = () =>
        reject(reader.error);

      reader.readAsText(file);
    },
  );
}

function readAsDataUrl(
  file: File,
) {
  return new Promise<string>(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
          String(reader.result || ""),
        );

      reader.onerror = () =>
        reject(reader.error);

      reader.readAsDataURL(file);
    },
  );
}

export default function BookUploadArea() {
  const [books, setBooks] =
    useState<StoredBook[]>([]);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    setBooks(loadLocalBooks());
  }, []);

  async function saveLocal(
    file: File,
  ) {
    const lower =
      file.name.toLowerCase();

    const slug =
      `${slugifyBookName(file.name)}-${Date.now()}`;

    const book: StoredBook = {
      id: createId(),
      slug,
      title:
        file.name.replace(
          /\.[^/.]+$/,
          "",
        ),
      fileName: file.name,
      mimeType:
        file.type || "application/octet-stream",
      size: file.size,
      uploadedAt:
        new Date().toISOString(),
      source: "local",
    };

    if (
      file.type.startsWith("text/") ||
      lower.endsWith(".txt") ||
      lower.endsWith(".md")
    ) {
      book.textContent =
        await readAsText(file);
    }

    if (
      file.size <=
        MAX_LOCAL_FILE_SIZE &&
      (
        lower.endsWith(".pdf") ||
        lower.endsWith(".epub")
      )
    ) {
      book.dataUrl =
        await readAsDataUrl(file);
    }

    const current =
      loadLocalBooks();

    const updated = [
      book,
      ...current,
    ].slice(0, 20);

    saveLocalBooks(updated);

    setLatestBookSlug(slug);

    setBooks(updated);

    return book;
  }

  async function saveSupabase(
    file: File,
  ) {
    const supabase =
      getSupabaseBrowserClient();

    if (!supabase) {
      throw new Error(
        "Supabase no está configurado.",
      );
    }

    const {
      data: userData,
    } =
      await supabase.auth.getUser();

    const user =
      userData.user;

    if (!user) {
      throw new Error(
        "Debes iniciar sesión.",
      );
    }

    const slug =
      `${slugifyBookName(file.name)}-${Date.now()}`;

    const safeName =
      file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_",
      );

    const storagePath =
      `${user.id}/${crypto.randomUUID()}-${safeName}`;

    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("books")
        .upload(
          storagePath,
          file,
          {
            upsert: false,
            contentType:
              file.type ||
              "application/octet-stream",
          },
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data,
      error,
    } =
      await supabase
        .from("books")
        .insert({
          user_id: user.id,
          slug,
          title:
            file.name.replace(
              /\.[^/.]+$/,
              "",
            ),
          file_name: file.name,
          mime_type:
            file.type ||
            "application/octet-stream",
          size_bytes:
            file.size,
          storage_path:
            storagePath,
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    setLatestBookSlug(slug);

    return data;
  }

  async function handleFiles(
    files: FileList | null,
  ) {
    if (
      !files ||
      files.length === 0
    ) {
      return;
    }

    setBusy(true);
    setMessage(
      "Procesando archivo...",
    );

    try {
      const mode =
        process.env
          .NEXT_PUBLIC_STORAGE_MODE ||
        "local";

      for (
        const file of
        Array.from(files)
      ) {
        const lower =
          file.name.toLowerCase();

        const allowed =
          lower.endsWith(".txt") ||
          lower.endsWith(".md") ||
          lower.endsWith(".pdf") ||
          lower.endsWith(".epub");

        if (!allowed) {
          continue;
        }

        if (mode === "supabase") {
          await saveSupabase(file);
        } else {
          await saveLocal(file);
        }
      }

      setMessage(
        "Libro cargado correctamente.",
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el libro.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 28,
        padding: 24,
        borderRadius: 24,
        background: "white",
        border:
          "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#111827",
        }}
      >
        Biblioteca
      </h2>

      <p
        style={{
          color: "#4b5563",
        }}
      >
        TXT, Markdown, PDF y EPUB.
      </p>

      <label
        style={{
          display: "inline-flex",
          padding: "13px 18px",
          borderRadius: 999,
          cursor:
            busy
              ? "not-allowed"
              : "pointer",
          background: "#111827",
          color: "white",
          fontWeight: 900,
        }}
      >
        {busy
          ? "Procesando..."
          : "Seleccionar libro"}

        <input
          type="file"
          multiple
          disabled={busy}
          accept=".txt,.md,.pdf,.epub"
          onChange={(event) =>
            handleFiles(
              event.target.files,
            )
          }
          style={{
            display: "none",
          }}
        />
      </label>

      {message ? (
        <p
          style={{
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {message}
        </p>
      ) : null}

      {books.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: 10,
            marginTop: 20,
          }}
        >
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/reader/${book.slug}`}
              style={{
                padding: 14,
                borderRadius: 14,
                border:
                  "1px solid #e5e7eb",
                textDecoration:
                  "none",
                color: "#111827",
              }}
            >
              <strong>
                {book.title}
              </strong>

              <div
                style={{
                  color: "#6b7280",
                  marginTop: 5,
                }}
              >
                {formatFileSize(
                  book.size,
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}