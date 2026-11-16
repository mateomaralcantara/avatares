"use client";

import Link from "next/link";

type Props = {
  slug: string;
};

export function IniciarLecturaButton({
  slug,
}: Props) {
  const safeSlug =
    encodeURIComponent(slug);

  return (
    <Link
      href={`/reader/${safeSlug}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        borderRadius: "999px",
        padding: "14px 22px",
        fontWeight: 900,
        color: "#111827",
        background:
          "linear-gradient(135deg,#facc15,#f97316)",
        boxShadow:
          "0 16px 35px rgba(249,115,22,.30)",
      }}
    >
      Iniciar lectura
    </Link>
  );
}

export default IniciarLecturaButton;