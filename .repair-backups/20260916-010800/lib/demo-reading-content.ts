// ============================================================
// ARCHIVO: lib/demo-reading-content.ts
// FUNCIÓN: Lee el libro completo desde content/books/[slug].txt
// ============================================================

import fs from "node:fs";
import path from "node:path";

export type DemoChapter = {
  number: number;
  title: string;
  body: string;
};

export type DemoReadingContent = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  chapters: DemoChapter[];
  fullText: string;
};

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug || "lectura-demo");
  } catch {
    return slug || "lectura-demo";
  }
}

function titleFromSlug(slug: string) {
  const decoded = decodeSlug(slug);
  const clean = decoded.replace(/[-_]+/g, " ").trim();

  if (!clean) {
    return "Lectura Demo";
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function cleanText(value: string) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function removeMarkdownTitle(line: string) {
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^t[ií]tulo\s*:\s*/i, "")
    .trim();
}

function getTitleFromText(rawText: string, slug: string) {
  const lines = cleanText(rawText)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstTitleLine = lines.find((line) =>
    /^#{1,2}\s+/.test(line) || /^t[ií]tulo\s*:/i.test(line)
  );

  if (firstTitleLine) {
    return removeMarkdownTitle(firstTitleLine);
  }

  return titleFromSlug(slug);
}

function truncateText(value: string, maxLength: number) {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function getSummaryFromText(rawText: string) {
  const cleaned = cleanText(rawText)
    .replace(/^#{1,6}\s+.+$/gm, "")
    .replace(/^cap[ií]tulo\s+\d+.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const paragraphs = cleaned
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter((paragraph) => paragraph.length > 80);

  if (paragraphs.length > 0) {
    return truncateText(paragraphs.slice(0, 2).join(" "), 950);
  }

  return "Este libro está conectado al lector completo.";
}

function splitLargeTextIntoParts(text: string, maxLength = 9000) {
  const clean = cleanText(text);
  const parts: string[] = [];
  let current = "";

  const paragraphs = clean
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const next = `${current}\n\n${paragraph}`.trim();

    if (next.length > maxLength && current.length > 0) {
      parts.push(current.trim());
      current = paragraph;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function parseChapters(rawText: string): DemoChapter[] {
  const text = cleanText(rawText);

  const chapterHeaderRegex =
    /(?:^|\n)(?:#{1,6}\s*)?(?:cap[ií]tulo|chapter|parte)\s+([0-9]+|[ivxlcdm]+)?[^\n]*/gi;

  const matches = Array.from(text.matchAll(chapterHeaderRegex));

  if (matches.length === 0) {
    const parts = splitLargeTextIntoParts(text);

    return parts.map((part, index) => ({
      number: index + 1,
      title: `Parte ${index + 1}`,
      body: part,
    }));
  }

  const chapters: DemoChapter[] = [];

  for (let index = 0; index < matches.length; index++) {
    const match = matches[index];
    const nextMatch = matches[index + 1];

    const headerStart = match.index ?? 0;
    const headerText = match[0].replace(/^\n/, "").trim();
    const bodyStart = headerStart + match[0].length;
    const bodyEnd = nextMatch?.index ?? text.length;
    const body = text.slice(bodyStart, bodyEnd).trim();

    chapters.push({
      number: index + 1,
      title: headerText || `Capítulo ${index + 1}`,
      body: body || "Este capítulo no tiene contenido todavía.",
    });
  }

  return chapters;
}

function getFallbackBookText(slug: string) {
  const title = titleFromSlug(slug);

  return `# ${title}

Capítulo 1: Contenido pendiente

Este libro todavía no tiene texto completo cargado.

Crea este archivo:

content/books/${slug}.txt

Luego coloca ahí el contenido completo del libro.`;
}

function readBookText(slug: string) {
  const safeSlug = slug || "lectura-demo";

  const filePath = path.join(
    process.cwd(),
    "content",
    "books",
    `${safeSlug}.txt`
  );

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf8");
  }

  return getFallbackBookText(safeSlug);
}

export function getDemoReadingContent(slug: string): DemoReadingContent {
  const safeSlug = slug || "lectura-demo";
  const rawText = readBookText(safeSlug);
  const fullText = cleanText(rawText);
  const title = getTitleFromText(fullText, safeSlug);
  const summary = getSummaryFromText(fullText);
  const chapters = parseChapters(fullText);

  return {
    slug: safeSlug,
    title,
    subtitle: "Libro completo conectado al agente narrador de voz.",
    summary,
    chapters,
    fullText,
  };
}