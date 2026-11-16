"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type UploadResult = {
  ok: boolean;
  slug?: string;
  totalWords?: number;
  readerUrl?: string;
  previewUrl?: string;
  message?: string;
};

export function BookUploadAutoReader() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setStatus("Selecciona un archivo primero.");
      return;
    }

    setIsUploading(true);
    setStatus("Subiendo y extrayendo texto del libro...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", title || file.name);

      const response = await fetch("/api/books/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResult;

      if (!response.ok || !data.ok) {
        setStatus(data.message || "No se pudo subir el libro.");
        setIsUploading(false);
        return;
      }

      setStatus(
        `Libro listo. Palabras detectadas: ${data.totalWords || 0}. Abriendo lector...`
      );

      router.push(data.readerUrl || `/reader/${data.slug}?autoplay=1`);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Error inesperado al subir el libro."
      );
      setIsUploading(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "780px",
        margin: "0 auto",
        borderRadius: "30px",
        padding: "32px",
        background: "rgba(15,23,42,0.94)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 30px 90px rgba(0,0,0,0.36)",
        color: "white",
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          color: "#facc15",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Subir libro
      </p>

      <h1
        style={{
          margin: "0 0 14px",
          fontSize: "clamp(34px, 6vw, 58px)",
          lineHeight: 1,
        }}
      >
        Subir y escuchar automáticamente
      </h1>

      <p
        style={{
          margin: "0 0 24px",
          color: "rgba(255,255,255,0.76)",
          lineHeight: 1.7,
          fontSize: "18px",
        }}
      >
        Sube un libro en TXT, MD, PDF, DOCX o EPUB. El sistema extrae el texto,
        lo guarda como libro real y abre el agente lector.
      </p>

      <form onSubmit={handleSubmit}>
        <label
          style={{
            display: "grid",
            gap: "8px",
            marginBottom: "16px",
            fontWeight: 800,
          }}
        >
          Título o nombre del libro
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej: Mi libro completo"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "16px",
              padding: "14px 16px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "#020617",
              color: "white",
              fontSize: "16px",
            }}
          />
        </label>

        <label
          style={{
            display: "grid",
            gap: "8px",
            marginBottom: "20px",
            fontWeight: 800,
          }}
        >
          Archivo del libro
          <input
            type="file"
            accept=".txt,.md,.markdown,.pdf,.docx,.epub"
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setStatus("");
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "16px",
              padding: "14px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "#020617",
              color: "white",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={isUploading}
          style={{
            width: "100%",
            border: 0,
            borderRadius: "999px",
            padding: "15px 22px",
            background: isUploading
              ? "linear-gradient(135deg, #64748b, #94a3b8)"
              : "linear-gradient(135deg, #facc15, #f97316)",
            color: "#111827",
            fontWeight: 900,
            fontSize: "16px",
            cursor: isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Procesando libro..." : "Subir libro y empezar lectura"}
        </button>
      </form>

      {status ? (
        <div
          style={{
            marginTop: "18px",
            padding: "16px",
            borderRadius: "18px",
            background: "rgba(250,204,21,0.08)",
            border: "1px solid rgba(250,204,21,0.22)",
            color: "rgba(255,255,255,0.86)",
            lineHeight: 1.6,
          }}
        >
          {status}
        </div>
      ) : null}
    </section>
  );
}

export default BookUploadAutoReader;