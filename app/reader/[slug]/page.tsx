"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import EpubReader from "@/components/EpubReader";

import {
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";

import {
  loadLocalBooks,
} from "@/lib/books/utils";

import type {
  StoredBook,
} from "@/lib/types/books";

type ReaderState = {
  book: StoredBook | null;
  url: string | null;
  loading: boolean;
  error: string;
};

export default function ReaderPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    String(params?.slug || "");

  const [state, setState] =
    useState<ReaderState>({
      book: null,
      url: null,
      loading: true,
      error: "",
    });

  useEffect(() => {
    async function load() {
      try {
        const localBook =
          loadLocalBooks().find(
            (item) =>
              item.slug === slug,
          );

        if (localBook) {
          setState({
            book: localBook,
            url:
              localBook.dataUrl ||
              null,
            loading: false,
            error: "",
          });

          return;
        }

        const supabase =
          getSupabaseBrowserClient();

        if (!supabase) {
          throw new Error(
            "Libro no encontrado.",
          );
        }

        const {
          data,
          error,
        } =
          await supabase
            .from("books")
            .select("*")
            .eq("slug", slug)
            .single();

        if (error || !data) {
          throw new Error(
            "Libro no encontrado.",
          );
        }

        const {
          data: signed,
          error: signedError,
        } =
          await supabase.storage
            .from("books")
            .createSignedUrl(
              data.storage_path,
              3600,
            );

        if (
          signedError ||
          !signed
        ) {
          throw new Error(
            "No se pudo abrir el archivo.",
          );
        }

        const book: StoredBook = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          fileName:
            data.file_name,
          mimeType:
            data.mime_type,
          size:
            data.size_bytes,
          uploadedAt:
            data.created_at,
          source: "supabase",
          storagePath:
            data.storage_path,
        };

        setState({
          book,
          url:
            signed.signedUrl,
          loading: false,
          error: "",
        });
      } catch (error) {
        setState({
          book: null,
          url: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Error cargando libro.",
        });
      }
    }

    load();
  }, [slug]);

  if (state.loading) {
    return (
      <main
        style={{
          padding: 40,
          color: "white",
          background: "#020617",
          minHeight: "100vh",
        }}
      >
        Cargando lector...
      </main>
    );
  }

  if (
    state.error ||
    !state.book
  ) {
    return (
      <main
        style={{
          padding: 40,
          color: "white",
          background: "#020617",
          minHeight: "100vh",
        }}
      >
        {state.error}
      </main>
    );
  }

  const book =
    state.book;

  const name =
    book.fileName.toLowerCase();

  const isTxt =
    name.endsWith(".txt");

  const isMarkdown =
    name.endsWith(".md");

  const isPdf =
    name.endsWith(".pdf");

  const isEpub =
    name.endsWith(".epub");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "40px 20px",
      }}
    >
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <p
            style={{
              color: "#facc15",
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            AvatarNarrador AI
          </p>

          <h1
            style={{
              margin: 0,
            }}
          >
            {book.title}
          </h1>
        </div>

        {isTxt &&
        book.textContent ? (
          <article
            style={{
              whiteSpace:
                "pre-wrap",
              background: "white",
              color: "#111827",
              padding: 32,
              borderRadius: 20,
              lineHeight: 1.8,
            }}
          >
            {book.textContent}
          </article>
        ) : null}

        {isMarkdown &&
        book.textContent ? (
          <article
            style={{
              background: "white",
              color: "#111827",
              padding: 32,
              borderRadius: 20,
              lineHeight: 1.8,
            }}
          >
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
              ]}
            >
              {book.textContent}
            </ReactMarkdown>
          </article>
        ) : null}

        {isPdf &&
        state.url ? (
          <iframe
            src={state.url}
            title={book.title}
            style={{
              width: "100%",
              height: "82vh",
              border: 0,
              borderRadius: 20,
              background: "white",
            }}
          />
        ) : null}

        {isEpub &&
        state.url ? (
          <EpubReader
            url={state.url}
          />
        ) : null}

        {!isTxt &&
        !isMarkdown &&
        !isPdf &&
        !isEpub ? (
          <div>
            Tipo de archivo no soportado.
          </div>
        ) : null}
      </section>
    </main>
  );
}