import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ignoreDirs = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".turbo",
  "coverage",
]);

const allowedExtensions = new Set([
  ".tsx",
  ".ts",
  ".jsx",
  ".js",
  ".json",
  ".md",
]);

const patterns = [
  "book",
  "books",
  "libro",
  "chapter",
  "chapters",
  "capitulo",
  "content",
  "contenido",
  "pdf",
  "epub",
  "audio",
  "avatar",
  "narration",
  "narracion",
  "slug",
  "reader",
  "lectura",
];

const results = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) {
        walk(fullPath);
      }
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    if (!allowedExtensions.has(ext)) {
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);

    let score = 0;
    const matches = [];

    lines.forEach((line, index) => {
      const lower = line.toLowerCase();

      for (const pattern of patterns) {
        if (lower.includes(pattern.toLowerCase())) {
          score += 1;

          matches.push({
            line: index + 1,
            pattern,
            text: line.trim(),
          });
        }
      }
    });

    if (score > 0) {
      results.push({
        file: path.relative(root, fullPath),
        score,
        matches: matches.slice(0, 12),
      });
    }
  }
}

walk(root);

results.sort((a, b) => b.score - a.score);

const report = [];

report.push("# Fuentes posibles para conectar el lector");
report.push("");
report.push(`Proyecto: ${root}`);
report.push("");
report.push("## Top archivos candidatos");
report.push("");

for (const item of results.slice(0, 40)) {
  report.push(`### ${item.file}`);
  report.push("");
  report.push(`Puntuación: ${item.score}`);
  report.push("");
  report.push("```txt");

  for (const match of item.matches) {
    report.push(
      `Línea ${match.line} | ${match.pattern} | ${match.text}`
    );
  }

  report.push("```");
  report.push("");
}

fs.writeFileSync(
  path.join(root, "FUENTES_REALES_LECTURA.md"),
  report.join("\n"),
  "utf8"
);

console.log("");
console.log("Reporte creado:");
console.log("FUENTES_REALES_LECTURA.md");
console.log("");
console.log("Abre con:");
console.log("notepad FUENTES_REALES_LECTURA.md");
console.log("");
