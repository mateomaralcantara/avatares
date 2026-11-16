import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const files = {
  button: path.join(root, "components", "iniciar-lectura-button.tsx"),
  floating: path.join(root, "components", "iniciar-lectura-floating-button.tsx"),
  reader: path.join(root, "app", "reader", "[slug]", "page.tsx"),
};

function backup(file) {
  if (!fs.existsSync(file)) return;

  const stamp = new Date()
    .toISOString()
    .replaceAll(":", "-")
    .replaceAll(".", "-");

  fs.copyFileSync(file, `${file}.bak-${stamp}`);
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  backup(file);
  fs.writeFileSync(file, content.trimStart(), "utf8");
}

const buttonContent = `
"use client";

import Link from "next/link";

type IniciarLecturaButtonProps = {
  slug?: string | null;
  hasAccess?: boolean;
  purchaseStatus?: string | null;
  previewAvailable?: boolean;
};

const VALID_ACCESS_STATUSES = new Set([
  "paid",
  "completed",
  "approved",
  "succeeded",
]);

export function IniciarLecturaButton({
  slug = "lectura-demo",
  hasAccess = true,
  purchaseStatus,
  previewAvailable = false,
}: IniciarLecturaButtonProps) {
  const safeSlug = encodeURIComponent(slug || "lectura-demo");
  const normalizedStatus = String(purchaseStatus || "").toLowerCase();
  const canRead = hasAccess || VALID_ACCESS_STATUSES.has(normalizedStatus);

  let href = \`/reader/\${safeSlug}\`;

  if (!canRead && previewAvailable) {
    href = \`/catalog/\${safeSlug}/preview\`;
  }

  if (!canRead && !previewAvailable) {
    href = \`/checkout?slug=\${safeSlug}\`;
  }

  return (
    <Link
      href={href}
      aria-label="Iniciar lectura"
      style={{
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        border: "0",
        borderRadius: "999px",
        padding: "14px 22px",
        fontSize: "16px",
        fontWeight: 900,
        cursor: "pointer",
        background: "linear-gradient(135deg, #facc15, #f97316)",
        color: "#111827",
        boxShadow: "0 16px 35px rgba(249, 115, 22, 0.35)",
        transition: "transform 160ms ease, opacity 160ms ease",
      }}
    >
      Iniciar lectura
    </Link>
  );
}

export default IniciarLecturaButton;
`;

const floatingContent = `
"use client";

import { usePathname } from "next/navigation";
import { IniciarLecturaButton } from "./iniciar-lectura-button";

export function IniciarLecturaFloatingButton() {
  const pathname = usePathname();

  if (pathname.startsWith("/reader")) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 9999,
        width: "260px",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <IniciarLecturaButton slug="lectura-demo" hasAccess={true} />
    </div>
  );
}

export default IniciarLecturaFloatingButton;
`;

const readerContent = `
export default function ReaderPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "radial-gradient(circle at top, rgba(249,115,22,0.22), transparent 35%), #020617",
        color: "white",
      }}
    >
      <section
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          borderRadius: "28px",
          padding: "36px",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(15,23,42,0.92)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            color: "#facc15",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Lector interno
        </p>

        <h1
          style={{
            margin: "0 0 18px",
            fontSize: "clamp(32px, 6vw, 58px)",
            lineHeight: 1,
          }}
        >
          Lectura iniciada
        </h1>

        <p
          style={{
            fontSize: "20px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.82)",
            marginBottom: 0,
          }}
        >
          El lector está listo. Aquí se cargará el contenido real del proyecto:
          libro, capítulo, PDF, EPUB, audio o narración con avatar.
        </p>

        <div
          style={{
            marginTop: "28px",
            padding: "22px",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            Próximo paso: conectar esta pantalla con la fuente real de lectura.
          </p>
        </div>
      </section>
    </main>
  );
}
`;

write(files.button, buttonContent);
write(files.floating, floatingContent);
write(files.reader, readerContent);

console.log("");
console.log("Corrección aplicada:");
console.log("- components/iniciar-lectura-button.tsx");
console.log("- components/iniciar-lectura-floating-button.tsx");
console.log("- app/reader/[slug]/page.tsx");
console.log("");
console.log("Cambios:");
console.log("- Quitado loading pegado.");
console.log("- El botón ahora usa <Link> de Next.");
console.log("- El botón flotante se oculta dentro de /reader.");
console.log("- Reader ya no dice 'Estás leyendo'.");
console.log("- Reader ya no muestra 'lectura-demo'.");
console.log("");
