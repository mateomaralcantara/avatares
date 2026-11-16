import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupRoot = path.join(root, ".upgrade-backup", stamp);
const reportPath = path.join(root, "UPGRADE_PLATFORM_RESULT.md");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const report = [];

function log(message = "") {
  console.log(message);
  report.push(String(message));
}

function ensureDir(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function backup(filePath) {
  if (!fs.existsSync(filePath)) return;
  const relativePath = path.relative(root, filePath);
  const destination = path.join(backupRoot, relativePath);
  ensureDir(path.dirname(destination));
  fs.copyFileSync(filePath, destination);
}

function write(relativePath, content) {
  const filePath = path.join(root, relativePath);
  backup(filePath);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${content.trim()}\n`, "utf8");
  log(`OK  ${relativePath}`);
}

function appendUnique(relativePath, lines) {
  const filePath = path.join(root, relativePath);
  backup(filePath);
  const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const additions = lines.filter((line) => !current.split(/\r?\n/).includes(line));
  if (additions.length === 0) return;
  const separator = current && !current.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(filePath, `${current}${separator}${additions.join("\n")}\n`, "utf8");
  log(`OK  ${relativePath} actualizado`);
}

function run(command, args, options = {}) {
  log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
    env: { ...process.env, CI: "1", FORCE_COLOR: "0" },
    maxBuffer: 50 * 1024 * 1024,
    timeout: options.timeout ?? 600000,
  });
  const output = [result.stdout, result.stderr, result.error?.message]
    .filter(Boolean)
    .join("\n")
    .trim();
  if (output) log(output);
  const code = typeof result.status === "number" ? result.status : 1;
  log(`CÃ³digo de salida: ${code}`);
  return { code, output };
}

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeVersion(value) {
  const match = String(value || "").match(/\d+\.\d+\.\d+/);
  return match?.[0] || "";
}

function migrateMiddleware() {
  const candidates = ["middleware.ts", "middleware.js"];
  for (const candidate of candidates) {
    const sourcePath = path.join(root, candidate);
    if (!fs.existsSync(sourcePath)) continue;
    const extension = path.extname(candidate);
    const targetRelative = `proxy${extension}`;
    const targetPath = path.join(root, targetRelative);
    if (fs.existsSync(targetPath)) {
      log(`WARN ${candidate} existe y ${targetRelative} ya estÃ¡ creado; no se migrÃ³.`);
      continue;
    }
    backup(sourcePath);
    let content = fs.readFileSync(sourcePath, "utf8");
    content = content
      .replace(/export\s+async\s+function\s+middleware\b/, "export async function proxy")
      .replace(/export\s+function\s+middleware\b/, "export function proxy")
      .replace(/export\s+default\s+async\s+function\s+middleware\b/, "export default async function proxy")
      .replace(/export\s+default\s+function\s+middleware\b/, "export default function proxy");
    fs.writeFileSync(targetPath, content, "utf8");
    fs.renameSync(sourcePath, `${sourcePath}.legacy-${stamp}`);
    log(`OK  ${candidate} migrado a ${targetRelative}`);
  }
}

log("# AVATARES PLATFORM UPGRADE");
log(`Proyecto: ${root}`);
log(`Backup: ${backupRoot}`);
ensureDir(backupRoot);

const packagePath = path.join(root, "package.json");
const packageJson = readJson("package.json");
if (!packageJson) {
  throw new Error("package.json no existe o contiene JSON invÃ¡lido.");
}
backup(packagePath);

if (fs.existsSync(path.join(root, "package-lock.json")) && fs.existsSync(path.join(root, "yarn.lock"))) {
  const legacyDir = path.join(root, ".upgrade-backup", stamp, "legacy-lockfiles");
  ensureDir(legacyDir);
  fs.renameSync(path.join(root, "yarn.lock"), path.join(legacyDir, "yarn.lock"));
  log("OK  yarn.lock movido al backup; npm queda como gestor Ãºnico.");
}

const nextVersion = normalizeVersion(
  packageJson.dependencies?.next || packageJson.devDependencies?.next,
);
const eslintNextPackage = nextVersion
  ? `eslint-config-next@${nextVersion}`
  : "eslint-config-next";

run(npmCommand, [
  "install",
  "@fal-ai/client",
  "zod",
  "pino",
]);

run(npmCommand, [
  "install",
  "--save-dev",
  "typescript",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "eslint",
  eslintNextPackage,
  "vitest",
  "@vitest/coverage-v8",
]);

const updatedPackage = readJson("package.json") || packageJson;
updatedPackage.scripts = {
  ...(updatedPackage.scripts || {}),
  dev: updatedPackage.scripts?.dev || "next dev",
  build: updatedPackage.scripts?.build || "next build",
  start: updatedPackage.scripts?.start || "next start",
  lint: "eslint .",
  "lint:fix": "eslint . --fix",
  typecheck: "tsc --noEmit",
  test: "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  quality: "npm run typecheck && npm run lint && npm run test && npm run build",
};
updatedPackage.engines = {
  ...(updatedPackage.engines || {}),
  node: ">=20.9.0",
};
fs.writeFileSync(packagePath, `${JSON.stringify(updatedPackage, null, 2)}\n`, "utf8");
log("OK  package.json profesionalizado");

write("tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    ".quality-report",
    ".upgrade-backup",
    "scripts"
  ]
}`);

write("eslint.config.mjs", `import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn"
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    ".quality-report/**",
    ".upgrade-backup/**",
    "next-env.d.ts"
  ])
]);`);

write("vitest.config.ts", `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/ai-platform/**/*.ts"]
    }
  }
});`);

write("lib/ai-platform/contracts.ts", `import { z } from "zod";

export const submitJobSchema = z.object({
  model: z.string().min(1).max(100),
  input: z.record(z.string(), z.unknown()),
  webhookUrl: z.string().url().optional(),
  idempotencyKey: z.string().min(8).max(200).optional()
});

export type SubmitJobInput = z.infer<typeof submitJobSchema>;

export type PlatformJob = {
  provider: "fal";
  model: string;
  endpoint: string;
  requestId: string;
  status: string;
  statusUrl?: string;
  responseUrl?: string;
  cancelUrl?: string;
};`);

write("lib/ai-platform/models.ts", `export type PlatformModel = {
  key: string;
  provider: "fal";
  endpoint: string;
  category: "image" | "video" | "audio" | "text";
  title: string;
  enabled: boolean;
};

export const MODEL_REGISTRY: Record<string, PlatformModel> = {
  "image-fast": {
    key: "image-fast",
    provider: "fal",
    endpoint: process.env.FAL_IMAGE_FAST_MODEL || "fal-ai/flux/schnell",
    category: "image",
    title: "Imagen rÃ¡pida",
    enabled: true
  },
  "image-quality": {
    key: "image-quality",
    provider: "fal",
    endpoint: process.env.FAL_IMAGE_QUALITY_MODEL || "fal-ai/flux/dev",
    category: "image",
    title: "Imagen de alta calidad",
    enabled: true
  }
};

export function getEnabledModels() {
  return Object.values(MODEL_REGISTRY).filter((model) => model.enabled);
}

export function getModel(modelKey: string) {
  const model = MODEL_REGISTRY[modelKey];
  return model?.enabled ? model : null;
}`);

write("lib/ai-platform/rate-limit.ts", `type RateEntry = {
  count: number;
  resetAt: number;
};

type RateStore = Map<string, RateEntry>;

const globalRateStore = globalThis as typeof globalThis & {
  __avataresRateStore?: RateStore;
};

const store = globalRateStore.__avataresRateStore || new Map<string, RateEntry>();
globalRateStore.__avataresRateStore = store;

export function checkRateLimit(identity: string) {
  const now = Date.now();
  const limit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 60);
  const existing = store.get(identity);

  if (!existing || existing.resetAt <= now) {
    const entry = { count: 1, resetAt: now + 60_000 };
    store.set(identity, entry);
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: entry.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}`);

write("lib/ai-platform/idempotency.ts", `type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const globalCache = globalThis as typeof globalThis & {
  __avataresIdempotency?: Map<string, CacheEntry<unknown>>;
};

const cache = globalCache.__avataresIdempotency || new Map<string, CacheEntry<unknown>>();
globalCache.__avataresIdempotency = cache;

export function getIdempotentResult<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function saveIdempotentResult<T>(key: string, value: T) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + 60 * 60 * 1000
  });
}`);

write("lib/ai-platform/logger.ts", `import pino from "pino";

export const platformLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: { service: "avatares-ai-platform" }
});`);

write("lib/ai-platform/fal-provider.ts", `import "server-only";
import { fal } from "@fal-ai/client";
import type { PlatformJob } from "./contracts";

function configureFal() {
  const credentials = process.env.FAL_KEY;
  if (!credentials) {
    throw new Error("FAL_KEY no estÃ¡ configurada en el servidor.");
  }
  fal.config({ credentials });
}

export async function submitFalJob(options: {
  model: string;
  endpoint: string;
  input: Record<string, unknown>;
  webhookUrl?: string;
}): Promise<PlatformJob> {
  configureFal();
  const submitted = await fal.queue.submit(options.endpoint, {
    input: options.input,
    webhookUrl: options.webhookUrl
  });

  return {
    provider: "fal",
    model: options.model,
    endpoint: options.endpoint,
    requestId: submitted.request_id,
    status: submitted.status,
    statusUrl: submitted.status_url,
    responseUrl: submitted.response_url,
    cancelUrl: submitted.cancel_url
  };
}

export async function getFalJobStatus(endpoint: string, requestId: string) {
  configureFal();
  return fal.queue.status(endpoint, {
    requestId,
    logs: true
  });
}

export async function getFalJobResult(endpoint: string, requestId: string) {
  configureFal();
  return fal.queue.result(endpoint, { requestId });
}`);

write("lib/ai-platform/gateway.ts", `import "server-only";
import { getModel } from "./models";
import { submitFalJob } from "./fal-provider";
import type { SubmitJobInput } from "./contracts";

export async function submitPlatformJob(payload: SubmitJobInput) {
  const model = getModel(payload.model);
  if (!model) {
    throw new Error("Modelo no permitido o deshabilitado.");
  }

  if (model.provider === "fal") {
    return submitFalJob({
      model: model.key,
      endpoint: model.endpoint,
      input: payload.input,
      webhookUrl: payload.webhookUrl
    });
  }

  throw new Error("Proveedor no soportado.");
}`);

write("app/api/ai/models/route.ts", `import { NextResponse } from "next/server";
import { getEnabledModels } from "@/lib/ai-platform/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    models: getEnabledModels().map(({ endpoint, ...model }) => model)
  });
}`);

write("app/api/ai/jobs/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { submitJobSchema } from "@/lib/ai-platform/contracts";
import { submitPlatformJob } from "@/lib/ai-platform/gateway";
import { checkRateLimit } from "@/lib/ai-platform/rate-limit";
import { getIdempotentResult, saveIdempotentResult } from "@/lib/ai-platform/idempotency";
import { platformLogger } from "@/lib/ai-platform/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIdentity(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export async function POST(request: NextRequest) {
  const rate = checkRateLimit(getIdentity(request));
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, error: "LÃ­mite de solicitudes excedido.", resetAt: rate.resetAt },
      { status: 429 }
    );
  }

  try {
    const parsed = submitJobSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Entrada invÃ¡lida.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cacheKey = parsed.data.idempotencyKey
      ? "ai-job:" + parsed.data.idempotencyKey
      : null;

    if (cacheKey) {
      const cached = getIdempotentResult(cacheKey);
      if (cached) {
        return NextResponse.json({ ok: true, cached: true, job: cached }, { status: 200 });
      }
    }

    const job = await submitPlatformJob(parsed.data);
    if (cacheKey) saveIdempotentResult(cacheKey, job);

    platformLogger.info({ requestId: job.requestId, model: job.model }, "AI job submitted");

    return NextResponse.json(
      { ok: true, cached: false, job, rateLimit: rate },
      { status: 202 }
    );
  } catch (error) {
    platformLogger.error({ error }, "AI job submission failed");
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno." },
      { status: 500 }
    );
  }
}`);

write("app/api/ai/jobs/[requestId]/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/ai-platform/models";
import { getFalJobResult, getFalJobStatus } from "@/lib/ai-platform/fal-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ requestId: string }>;
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { requestId } = await params;
    const modelKey = request.nextUrl.searchParams.get("model") || "";
    const includeResult = request.nextUrl.searchParams.get("result") === "1";
    const model = getModel(modelKey);

    if (!model) {
      return NextResponse.json({ ok: false, error: "Modelo invÃ¡lido." }, { status: 400 });
    }

    const status = await getFalJobStatus(model.endpoint, requestId);
    const normalizedStatus = String(status.status || "UNKNOWN");

    if (includeResult && normalizedStatus === "COMPLETED") {
      const result = await getFalJobResult(model.endpoint, requestId);
      return NextResponse.json({ ok: true, status, result });
    }

    return NextResponse.json({ ok: true, status });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno." },
      { status: 500 }
    );
  }
}`);

write("app/api/health/route.ts", `import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "avatares-ai-platform",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    providers: {
      fal: Boolean(process.env.FAL_KEY)
    }
  });
}`);

write("app/loading.tsx", `export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" style={{ padding: 32 }}>
      <h1>Cargando</h1>
      <p>Preparando la experiencia de inteligencia artificial.</p>
    </main>
  );
}`);

write("app/error.tsx", `"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main role="alert" style={{ padding: 32 }}>
      <h1>No pudimos completar la operaciÃ³n</h1>
      <p>El incidente fue aislado. Puedes volver a intentarlo.</p>
      <button type="button" onClick={reset}>Reintentar</button>
    </main>
  );
}`);

write("app/not-found.tsx", `import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: 32 }}>
      <h1>PÃ¡gina no encontrada</h1>
      <p>La direcciÃ³n solicitada no existe o fue movida.</p>
      <Link href="/">Volver al inicio</Link>
    </main>
  );
}`);

write("tests/ai-platform.test.ts", `import { describe, expect, it } from "vitest";
import { submitJobSchema } from "../lib/ai-platform/contracts";
import { getEnabledModels, getModel } from "../lib/ai-platform/models";

 describe("AI platform core", () => {
  it("expone modelos permitidos", () => {
    expect(getEnabledModels().length).toBeGreaterThan(0);
    expect(getModel("image-fast")?.provider).toBe("fal");
  });

  it("rechaza solicitudes sin modelo", () => {
    const result = submitJobSchema.safeParse({ input: {} });
    expect(result.success).toBe(false);
  });

  it("acepta una solicitud vÃ¡lida", () => {
    const result = submitJobSchema.safeParse({
      model: "image-fast",
      input: { prompt: "un leÃ³n futurista" },
      idempotencyKey: "request-12345678"
    });
    expect(result.success).toBe(true);
  });
});`);

write(".github/workflows/quality.yml", `name: Quality Gate

on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
        env:
          FAL_KEY: test-key-not-used-during-build
`);

appendUnique(".gitignore", [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".quality-report/",
  ".upgrade-backup/",
  "coverage/",
  "UPGRADE_PLATFORM_RESULT.md",
]);

appendUnique(".env.example", [
  "FAL_KEY=",
  "FAL_IMAGE_FAST_MODEL=fal-ai/flux/schnell",
  "FAL_IMAGE_QUALITY_MODEL=fal-ai/flux/dev",
  "AI_RATE_LIMIT_PER_MINUTE=60",
  "LOG_LEVEL=info",
]);

migrateMiddleware();

if (!fs.existsSync(path.join(root, ".git"))) {
  const gitInit = run("git", ["init"], { timeout: 30000 });
  if (gitInit.code !== 0) log("WARN No se pudo inicializar Git.");
}

run(npmCommand, ["audit", "fix"], { timeout: 300000 });

const checks = [
  ["TYPECHECK", ["run", "typecheck"]],
  ["LINT", ["run", "lint"]],
  ["TEST", ["run", "test"]],
  ["BUILD", ["run", "build"]],
];

for (const [name, commandArgs] of checks) {
  log(`\n## ${name}`);
  run(npmCommand, commandArgs, { timeout: name === "BUILD" ? 600000 : 300000 });
}

fs.writeFileSync(reportPath, `${report.join("\n")}\n`, "utf8");
log(`\nReporte final: ${reportPath}`);
log("Upgrade terminado. Revisa los errores restantes antes de desplegar.");