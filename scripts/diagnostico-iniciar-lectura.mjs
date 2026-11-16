import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const root = process.cwd();

const files = {
  layout: path.join(root, "app", "layout.tsx"),
  button: path.join(root, "components", "iniciar-lectura-button.tsx"),
  floating: path.join(root, "components", "iniciar-lectura-floating-button.tsx"),
  reader: path.join(root, "app", "reader", "[slug]", "page.tsx"),
};

function exists(file) {
  return fs.existsSync(file);
}

function read(file) {
  return exists(file) ? fs.readFileSync(file, "utf8") : "";
}

function pos(text, needle) {
  return text.indexOf(needle);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function httpCheck(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        resolve({
          ok: true,
          statusCode: res.statusCode,
          length: body.length,
        });
      });
    });

    req.on("error", (error) => {
      resolve({
        ok: false,
        statusCode: 0,
        length: 0,
        error: error.message,
      });
    });

    req.setTimeout(8000, () => {
      req.destroy();

      resolve({
        ok: false,
        statusCode: 0,
        length: 0,
        error: "timeout",
      });
    });
  });
}

const report = [];

function line(text = "") {
  report.push(text);
}

function ok(text) {
  line(`✅ ${text}`);
}

function warn(text) {
  line(`⚠️ ${text}`);
}

function bad(text) {
  line(`❌ ${text}`);
}

line("# Diagnóstico real: Iniciar lectura");
line("");
line(`Proyecto: ${root}`);
line("");

line("## 1. Archivos");
line("");

for (const [name, file] of Object.entries(files)) {
  if (exists(file)) {
    ok(`${name}: existe -> ${path.relative(root, file)}`);
  } else {
    bad(`${name}: NO existe -> ${path.relative(root, file)}`);
  }
}

const layout = read(files.layout);
const button = read(files.button);
const floating = read(files.floating);
const reader = read(files.reader);

line("");
line("## 2. Layout");
line("");

const htmlOpen = pos(layout, "<html");
const bodyOpen = pos(layout, "<body");
const bodyClose = pos(layout, "</body>");
const htmlClose = pos(layout, "</html>");
const floatingRender = pos(layout, "<IniciarLecturaFloatingButton");
const childrenRender = pos(layout, "{children}");

line("Posiciones:");
line("");
line("```txt");
line(`<html: ${htmlOpen}`);
line(`<body: ${bodyOpen}`);
line(`<IniciarLecturaFloatingButton: ${floatingRender}`);
line(`{children}: ${childrenRender}`);
line(`</body>: ${bodyClose}`);
line(`</html>: ${htmlClose}`);
line("```");
line("");

if (htmlOpen >= 0) ok("Tiene etiqueta html");
else bad("No tiene etiqueta html");

if (bodyOpen >= 0) ok("Tiene etiqueta body");
else bad("No tiene etiqueta body");

if (bodyClose >= 0) ok("Tiene cierre body");
else bad("No tiene cierre body");

if (htmlClose >= 0) ok("Tiene cierre html");
else bad("No tiene cierre html");

if (floatingRender >= 0) ok("Renderiza IniciarLecturaFloatingButton");
else bad("NO renderiza IniciarLecturaFloatingButton");

if (childrenRender >= 0) ok("Renderiza children");
else bad("NO renderiza children");

if (bodyOpen >= 0 && bodyClose >= 0 && floatingRender >= 0) {
  if (floatingRender > bodyOpen && floatingRender < bodyClose) {
    ok("El botón está dentro del body");
  } else {
    bad("El botón está FUERA del body. Esto rompe hidratación.");
  }
}

if (bodyOpen >= 0 && bodyClose >= 0 && childrenRender >= 0) {
  if (childrenRender > bodyOpen && childrenRender < bodyClose) {
    ok("children está dentro del body");
  } else {
    bad("children está FUERA del body. Esto rompe hidratación.");
  }
}

const floatingCount = count(layout, /<IniciarLecturaFloatingButton/g);
const childrenCount = count(layout, /\{children\}/g);

if (floatingCount === 1) ok("Solo hay un botón flotante en layout");
else bad(`Hay ${floatingCount} botones flotantes en layout`);

if (childrenCount === 1) ok("Solo hay un children en layout");
else bad(`Hay ${childrenCount} children en layout`);

line("");
line("Layout actual:");
line("");
line("```tsx");

layout.split(/\r?\n/).forEach((value, index) => {
  line(`${String(index + 1).padStart(4, " ")}: ${value}`);
});

line("```");

line("");
line("## 3. Botón");
line("");

if (button.includes('"use client"') || button.includes("'use client'")) {
  ok("El botón es client component");
} else {
  bad("El botón no tiene use client");
}

if (button.includes("useRouter")) ok("Usa useRouter");
else bad("No usa useRouter");

if (button.includes("router.push")) ok("Usa router.push");
else bad("No usa router.push");

if (button.includes("/reader/")) ok("Tiene ruta reader");
else bad("No tiene ruta reader");

if (button.includes("setLoading(true)")) ok("Activa loading");
else warn("No encontré setLoading(true)");

if (button.includes("setLoading(false)")) {
  ok("Apaga loading");
} else {
  warn("No encontré setLoading(false). Si falla la navegación, se queda en Abriendo lectura.");
}

line("");
line("Líneas críticas del botón:");
line("");
line("```tsx");

button.split(/\r?\n/).forEach((value, index) => {
  if (
    value.includes("router.push") ||
    value.includes("setLoading") ||
    value.includes("safeSlug") ||
    value.includes("target") ||
    value.includes("Abriendo lectura") ||
    value.includes("Iniciar lectura")
  ) {
    line(`${String(index + 1).padStart(4, " ")}: ${value}`);
  }
});

line("```");

line("");
line("## 4. Botón flotante");
line("");

if (floating.includes('"use client"') || floating.includes("'use client'")) {
  ok("El flotante es client component");
} else {
  bad("El flotante no tiene use client");
}

if (floating.includes("usePathname")) ok("Usa usePathname");
else warn("No usa usePathname");

if (floating.includes('pathname.startsWith("/reader")')) {
  ok("Se oculta en reader");
} else {
  warn("No se oculta en reader");
}

if (floating.includes("lectura-demo")) {
  warn("Todavía usa slug demo lectura-demo");
} else {
  ok("No usa lectura-demo");
}

line("");
line("## 5. Reader");
line("");

if (reader.includes("export default")) ok("Reader exporta default");
else bad("Reader no exporta default");

if (reader.includes("<main")) ok("Reader tiene main");
else warn("Reader no tiene main");

if (reader.includes("Estás leyendo")) {
  bad("Reader todavía dice Estás leyendo");
} else {
  ok("Reader no dice Estás leyendo");
}

if (reader.includes("lectura-demo")) {
  bad("Reader todavía muestra lectura-demo");
} else {
  ok("Reader no muestra lectura-demo");
}

line("");
line("## 6. Prueba HTTP local");
line("");

const home = await httpCheck("http://localhost:3000");
const readerUrl = await httpCheck("http://localhost:3000/reader/lectura-demo");

if (home.ok) {
  ok(`Home responde ${home.statusCode}, tamaño ${home.length}`);
} else {
  warn(`Home no respondió: ${home.error}`);
}

if (readerUrl.ok) {
  ok(`Reader responde ${readerUrl.statusCode}, tamaño ${readerUrl.length}`);
} else {
  bad(`Reader no respondió: ${readerUrl.error}`);
}

line("");
line("## 7. Conclusión");
line("");

const full = report.join("\n");

if (full.includes("FUERA del body")) {
  bad("El problema principal es app/layout.tsx: algo está fuera del body.");
  line("");
  line("Solución esperada:");
  line("");
  line("```tsx");
  line("<html lang=\"es\">");
  line("  <body>");
  line("    {children}");
  line("    <IniciarLecturaFloatingButton />");
  line("  </body>");
  line("</html>");
  line("```");
} else if (readerUrl.ok) {
  ok("La ruta reader sí abre. Si visualmente se queda cargando, el problema está en estado loading, hidratación del navegador o duplicados.");
} else {
  bad("La ruta reader no abre. Hay que corregir app/reader/[slug]/page.tsx.");
}

fs.writeFileSync(
  path.join(root, "DIAGNOSTICO_INICIAR_LECTURA.md"),
  report.join("\n"),
  "utf8"
);

console.log("");
console.log("Diagnóstico creado:");
console.log("DIAGNOSTICO_INICIAR_LECTURA.md");
console.log("");
console.log("Abre con:");
console.log("notepad DIAGNOSTICO_INICIAR_LECTURA.md");
console.log("");
