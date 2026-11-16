"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  url: string;
};

export default function EpubReader({
  url,
}: Props) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let destroyed = false;
    let book: any = null;
    let rendition: any = null;

    async function start() {
      try {
        const module = await import("epubjs");

        const epub =
          module.default || module;

        if (
          !containerRef.current ||
          destroyed
        ) {
          return;
        }

        book = epub(url);

        rendition = book.renderTo(
          containerRef.current,
          {
            width: "100%",
            height: "75vh",
          },
        );

        await rendition.display();
      } catch (err) {
        console.error(err);

        setError(
          "No se pudo abrir el EPUB.",
        );
      }
    }

    start();

    return () => {
      destroyed = true;

      try {
        rendition?.destroy?.();
      } catch {}

      try {
        book?.destroy?.();
      } catch {}
    };
  }, [url]);

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "#fee2e2",
          color: "#991b1b",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "75vh",
        background: "white",
        borderRadius: "18px",
        overflow: "hidden",
      }}
    />
  );
}