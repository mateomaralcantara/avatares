import fs from "node:fs";
import path from "node:path";

const root =
  process.cwd();

const checks = [
  {
    name:
      "Book upload profesional",
    file:
      "components/BookUploadArea.tsx",
    tokens: [
      "NEXT_PUBLIC_STORAGE_MODE",
      "saveSupabase",
      "saveLocal",
    ],
  },

  {
    name:
      "Reader dinámico",
    file:
      "app/reader/[slug]/page.tsx",
    tokens: [
      "ReactMarkdown",
      "EpubReader",
      "iframe",
    ],
  },

  {
    name:
      "EPUB",
    file:
      "components/EpubReader.tsx",
    tokens: [
      "epubjs",
      "renderTo",
    ],
  },

  {
    name:
      "Supabase browser",
    file:
      "lib/supabase/client.ts",
    tokens: [
      "createBrowserClient",
    ],
  },

  {
    name:
      "Supabase server",
    file:
      "lib/supabase/server.ts",
    tokens: [
      "createServerClient",
    ],
  },

  {
    name:
      "Migración DB",
    file:
      "supabase/migrations/001_avatar_narrador.sql",
    tokens: [
      "create table",
      "row level security",
      "storage.buckets",
    ],
  },

  {
    name:
      "Narration jobs",
    file:
      "app/api/narration/jobs/route.ts",
    tokens: [
      "narration_jobs",
      "queued",
    ],
  },

  {
    name:
      "Health API",
    file:
      "app/api/health/route.ts",
    tokens: [
      "healthy",
    ],
  },

  {
    name:
      "Provider architecture",
    file:
      "lib/providers/config.ts",
    tokens: [
      "TTS_PROVIDER",
      "AVATAR_PROVIDER",
    ],
  },

  {
    name:
      "Tests",
    file:
      "tests/architecture.test.ts",
    tokens: [
      "describe",
      "expect",
    ],
  },
];

let passed = 0;

console.log("");
console.log(
  "==============================================",
);

console.log(
  " AVATARNARRADOR AI - AUDITORÍA 10/10",
);

console.log(
  "==============================================",
);

console.log("");

for (
  const check of checks
) {
  const filePath =
    path.join(
      root,
      check.file,
    );

  let ok =
    fs.existsSync(filePath);

  if (ok) {
    const content =
      fs.readFileSync(
        filePath,
        "utf8",
      );

    ok =
      check.tokens.every(
        (token) =>
          content.includes(token),
      );
  }

  if (ok) {
    passed++;

    console.log(
      `PASS  ${check.name}`,
    );
  } else {
    console.log(
      `FAIL  ${check.name}`,
    );
  }
}

const score =
  (
    (passed /
      checks.length) *
    10
  ).toFixed(1);

console.log("");
console.log(
  `NOTA ESTRUCTURAL: ${score}/10`,
);

console.log("");

if (
  passed !==
  checks.length
) {
  process.exitCode = 1;
}