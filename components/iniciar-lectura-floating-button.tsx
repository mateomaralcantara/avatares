"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  LAST_BOOK_KEY,
} from "@/lib/books/utils";

import {
  IniciarLecturaButton,
} from "./iniciar-lectura-button";

export function IniciarLecturaFloatingButton() {
  const pathname = usePathname();

  const [slug, setSlug] =
    useState<string | null>(null);

  useEffect(() => {
    function update() {
      const latest =
        window.localStorage.getItem(
          LAST_BOOK_KEY,
        );

      setSlug(latest);
    }

    update();

    window.addEventListener(
      "storage",
      update,
    );

    window.addEventListener(
      "avatarNarradorBooksUpdated",
      update,
    );

    return () => {
      window.removeEventListener(
        "storage",
        update,
      );

      window.removeEventListener(
        "avatarNarradorBooksUpdated",
        update,
      );
    };
  }, []);

  if (
    pathname.startsWith("/reader") ||
    !slug
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 9999,
      }}
    >
      <IniciarLecturaButton
        slug={slug}
      />
    </div>
  );
}

export default IniciarLecturaFloatingButton;