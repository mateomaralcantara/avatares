import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const root = process.cwd();

const args = process.argv.slice(2);

function hasFlag(flag) {
  return args.includes(flag);
}

function getNumberArgument(prefix, fallback) {
  const argument = args.find((item) => item.startsWith(prefix));

  if (!argument) {
    return fallback;
  }

  const value = Number(argument.slice(prefix.length));

  return Number.isFinite(value) ? value : fallback;
}

const options = {
  minimumScore: getNumberArgument("--minimum=", 8),
  skipBuild: hasFlag("--skip-build"),
  skipTests: hasFlag("--skip-tests"),
  skipAudit: hasFlag("--skip-audit"),
};

const reportDirectory = path.join(root, ".quality-report");
const timestamp = new Date()
  .toISOString()
  .replaceAll(":", "-")
  .replaceAll(".", "-");

const ignoredDirectories = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "dist",
  "build",
  "out",
  ".quality-report",
  ".turbo",
  ".vercel",
]);

const sourceExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

const scanExtensions = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
  ".txt",
  ".yml",
  ".yaml",
]);

const checks = [];

const colors = {
  reset: "\u001b[0m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
  gray: "\u001b[90m",
  bold: "\u001b[1m",
};

function color(value, selectedColor) {
  return `${selectedColor}${value}${colors.reset}`;
}

function section(title) {
  console.log("");
  console.log(color("=".repeat(72), colors.gray));
  console.log(color(title, colors.cyan));
  console.log(color("=".repeat(72), colors.gray));
}

function statusColor(status) {
  if (status === "PASS") return colors.green;
  if (status === "WARN") return colors.yellow;
  if (status === "FAIL") return colors.red;
  return colors.gray;
}

function addCheck({
  category,
  name,
  maximum,
  earned,
  status,
  details,
  recommendation = "",
}) {
  const safeEarned = Math.max(
    0,
    Math.min(maximum, Number(earned) || 0),
  );

  checks.push({
    category,
    name,
    status,
    earned: Number(safeEarned.toFixed(2)),
    maximum: Number(maximum.toFixed(2)),
    percentage:
      maximum > 0
        ? Number(((safeEarned / maximum) * 100).toFixed(1))
        : 0,
    details,
    recommendation,
  });
}

function printCheck(check) {
  const score = `${check.earned.toFixed(1)}/${check.maximum.toFixed(1)}`;

  console.log(
    `${color(`[${check.status}]`, statusColor(check.status))} ` +
      `${check.name.padEnd(38)} ${score.padStart(10)}`,
  );

  if (check.details) {
    console.log(color(`       ${check.details}`, colors.gray));
  }
}

function walk(directory, results = []) {
  let entries = [];

  try {
    entries = fs.readdirSync(directory, {
      withFileTypes: true,
    });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }

    if (entry.isFile()) {
      results.push(fullPath);
    }
  }

  return results;
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function anyExists(relativePaths) {
  return relativePaths.some(exists);
}

function parseJson(filePath) {
  try {
    return JSON.parse(readText(filePath));
  } catch {
    return null;
  }
}

function parseJsonC(filePath) {
  try {
    const text = readText(filePath)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/,\s*([}\]])/g, "$1");

    return JSON.parse(text);
  } catch {
    return null;
  }
}

function run(command, timeoutMilliseconds = 120000) {
  const startedAt = Date.now();

  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: "utf8",
    timeout: timeoutMilliseconds,
    maxBuffer: 30 * 1024 * 1024,
    env: {
      ...process.env,
      CI: "1",
      FORCE_COLOR: "0",
    },
  });

  const output = [
    result.stdout || "",
    result.stderr || "",
    result.error?.message || "",
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  return {
    command,
    code: typeof result.status === "number" ? result.status : -1,
    timedOut: result.error?.code === "ETIMEDOUT",
    durationSeconds: Number(
      ((Date.now() - startedAt) / 1000).toFixed(2),
    ),
    output,
  };
}

function countPattern(files, regex) {
  let count = 0;

  for (const file of files) {
    const text = readText(file);

    if (!text) {
      continue;
    }

    const flags = regex.flags.includes("g")
      ? regex.flags
      : `${regex.flags}g`;

    const safeRegex = new RegExp(regex.source, flags);
    count += [...text.matchAll(safeRegex)].length;
  }

  return count;
}

function relative(filePath) {
  return path.relative(root, filePath);
}

function getLineCount(filePath) {
  return readText(filePath).split(/\r?\n/).length;
}

function getGrade(score) {
  if (score >= 9.5) return "A+";
  if (score >= 9) return "A";
  if (score >= 8.5) return "B+";
  if (score >= 8) return "B";
  if (score >= 7) return "C";
  if (score >= 6) return "D";
  return "F";
}

function csvEscape(value) {
  const text = String(value ?? "");

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

const allFiles = walk(root);

const sourceFiles = allFiles.filter((file) =>
  sourceExtensions.has(path.extname(file).toLowerCase()),
);

const scanFiles = allFiles.filter((file) => {
  const extension = path.extname(file).toLowerCase();
  const baseName = path.basename(file).toLowerCase();

  return (
    scanExtensions.has(extension) ||
    baseName.startsWith(".env")
  );
});

const packagePath = path.join(root, "package.json");
const packageJson = parseJson(packagePath);

const scripts = packageJson?.scripts || {};

const dependencies = {
  ...(packageJson?.dependencies || {}),
  ...(packageJson?.devDependencies || {}),
};

console.log("");
console.log(
  color(
    "  +----------------------------------------------------------+",
    colors.cyan,
  ),
);
console.log(
  color(
    "  |           AVATARES - PROJECT QUALITY SCANNER            |",
    colors.cyan,
  ),
);
console.log(
  color(
    "  |        Evaluación profesional de 0.0 a 10.0             |",
    colors.cyan,
  ),
);
console.log(
  color(
    "  +----------------------------------------------------------+",
    colors.cyan,
  ),
);
console.log("");
console.log(`  Proyecto: ${root}`);
console.log(`  Inicio:   ${new Date().toLocaleString()}`);
console.log(`  Mínimo:   ${options.minimumScore}/10.0`);

section("1/10 — ENTORNO DE EJECUCIÓN");

addCheck({
  category: "Entorno",
  name: "package.json válido",
  maximum: 2,
  earned: packageJson ? 2 : 0,
  status: packageJson ? "PASS" : "FAIL",
  details: packageJson
    ? "El manifiesto del proyecto es válido."
    : "package.json no existe o contiene JSON inválido.",
  recommendation: "Corrige package.json.",
});

const lockFiles = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
].filter(exists);

addCheck({
  category: "Entorno",
  name: "Lockfile reproducible",
  maximum: 1,
  earned:
    lockFiles.length === 1
      ? 1
      : lockFiles.length > 1
        ? 0.5
        : 0,
  status:
    lockFiles.length === 1
      ? "PASS"
      : lockFiles.length > 1
        ? "WARN"
        : "FAIL",
  details:
    lockFiles.length > 0
      ? `Detectados: ${lockFiles.join(", ")}.`
      : "No se encontró lockfile.",
  recommendation:
    "Conserva solamente el lockfile del gestor de paquetes utilizado.",
});

const nodeMajor = Number(process.versions.node.split(".")[0]);
const enginesNode = packageJson?.engines?.node || "";
const requiredNodeMatch = String(enginesNode).match(/\d+/);
const requiredNodeMajor = requiredNodeMatch
  ? Number(requiredNodeMatch[0])
  : null;

const nodeCompatible =
  !requiredNodeMajor || nodeMajor >= requiredNodeMajor;

addCheck({
  category: "Entorno",
  name: "Versión de Node.js",
  maximum: 2,
  earned: nodeCompatible ? 2 : 0.5,
  status: nodeCompatible ? "PASS" : "FAIL",
  details: `Instalada: ${process.version}. Engines: ${
    enginesNode || "no definido"
  }.`,
  recommendation: "Actualiza Node.js a una versión compatible.",
});

const hasNodeModules = exists("node_modules");

addCheck({
  category: "Entorno",
  name: "Dependencias instaladas",
  maximum: 1,
  earned: hasNodeModules ? 1 : 0,
  status: hasNodeModules ? "PASS" : "FAIL",
  details: hasNodeModules
    ? "node_modules está disponible."
    : "No existe node_modules.",
  recommendation: "Ejecuta npm install.",
});

const gitResult = run("git rev-parse --is-inside-work-tree", 20000);
const isGitRepository =
  gitResult.code === 0 &&
  gitResult.output.toLowerCase().includes("true");

addCheck({
  category: "Entorno",
  name: "Repositorio Git",
  maximum: 1,
  earned: isGitRepository ? 1 : 0,
  status: isGitRepository ? "PASS" : "WARN",
  details: isGitRepository
    ? "El proyecto está bajo control de versiones."
    : "No se detectó repositorio Git.",
});

addCheck({
  category: "Entorno",
  name: "Versión fijada en engines",
  maximum: 1,
  earned: enginesNode ? 1 : 0.4,
  status: enginesNode ? "PASS" : "WARN",
  details: enginesNode
    ? `engines.node: ${enginesNode}.`
    : "package.json no define engines.node.",
  recommendation: "Define engines.node en package.json.",
});

section("2/10 — ARQUITECTURA Y ORGANIZACIÓN");

const hasRouter = anyExists([
  "app",
  "src/app",
  "pages",
  "src/pages",
]);

addCheck({
  category: "Arquitectura",
  name: "Router organizado",
  maximum: 2,
  earned: hasRouter ? 2 : 0,
  status: hasRouter ? "PASS" : "FAIL",
  details: hasRouter
    ? "Se detectó App Router o Pages Router."
    : "No se detectó un router de Next.js.",
});

const hasComponents = anyExists([
  "components",
  "src/components",
]);

addCheck({
  category: "Arquitectura",
  name: "Componentes separados",
  maximum: 1.5,
  earned: hasComponents ? 1.5 : 0,
  status: hasComponents ? "PASS" : "WARN",
  details: hasComponents
    ? "Existe una carpeta de componentes."
    : "No existe components o src/components.",
});

const hasLogicLayer = anyExists([
  "lib",
  "src/lib",
  "services",
  "src/services",
  "server",
  "src/server",
]);

addCheck({
  category: "Arquitectura",
  name: "Lógica reutilizable separada",
  maximum: 1,
  earned: hasLogicLayer ? 1 : 0,
  status: hasLogicLayer ? "PASS" : "WARN",
  details: hasLogicLayer
    ? "Se detectó una capa lib, services o server."
    : "La lógica puede estar mezclada con la interfaz.",
});

const largeSourceFiles = sourceFiles
  .map((file) => ({
    file: relative(file),
    lines: getLineCount(file),
  }))
  .filter((item) => item.lines > 600)
  .sort((a, b) => b.lines - a.lines);

const largeFileScore =
  largeSourceFiles.length === 0
    ? 2
    : largeSourceFiles.length <= 3
      ? 1
      : 0;

addCheck({
  category: "Arquitectura",
  name: "Tamaño de archivos fuente",
  maximum: 2,
  earned: largeFileScore,
  status:
    largeFileScore === 2
      ? "PASS"
      : largeFileScore > 0
        ? "WARN"
        : "FAIL",
  details: `${largeSourceFiles.length} archivo(s) superan 600 líneas.`,
  recommendation:
    "Divide componentes y servicios demasiado grandes.",
});

const backupFiles = allFiles.filter((file) =>
  /\.(bak-\d+|backup|old)$/i.test(file),
);

const backupScore =
  backupFiles.length === 0
    ? 1
    : backupFiles.length <= 3
      ? 0.5
      : 0;

addCheck({
  category: "Arquitectura",
  name: "Respaldos dentro del proyecto",
  maximum: 1,
  earned: backupScore,
  status:
    backupScore === 1
      ? "PASS"
      : backupScore > 0
        ? "WARN"
        : "FAIL",
  details: `${backupFiles.length} respaldo(s) internos detectados.`,
  recommendation:
    "Mueve respaldos fuera del código fuente y usa Git.",
});

const demoMarkers = countPattern(
  sourceFiles,
  /\b(lectura-demo|placeholder|lorem ipsum|TODO|FIXME)\b/gi,
);

const demoScore =
  demoMarkers === 0
    ? 1.5
    : demoMarkers <= 5
      ? 1
      : demoMarkers <= 15
        ? 0.5
        : 0;

addCheck({
  category: "Arquitectura",
  name: "Contenido demo o pendiente",
  maximum: 1.5,
  earned: demoScore,
  status:
    demoScore === 1.5
      ? "PASS"
      : demoScore > 0
        ? "WARN"
        : "FAIL",
  details: `${demoMarkers} marcador(es) demo, TODO o FIXME.`,
  recommendation: "Elimina contenido temporal.",
});

const consoleLogs = countPattern(
  sourceFiles,
  /console\.(log|debug)\s*\(/gi,
);

const consoleScore =
  consoleLogs === 0
    ? 1.5
    : consoleLogs <= 5
      ? 1
      : consoleLogs <= 15
        ? 0.5
        : 0;

addCheck({
  category: "Arquitectura",
  name: "Logs de depuración",
  maximum: 1.5,
  earned: consoleScore,
  status:
    consoleScore === 1.5
      ? "PASS"
      : consoleScore > 0
        ? "WARN"
        : "FAIL",
  details: `${consoleLogs} console.log o console.debug detectados.`,
  recommendation: "Usa un logger controlado por entorno.",
});

section("3/10 — TYPESCRIPT Y CALIDAD ESTÁTICA");

const tsconfig = parseJsonC(path.join(root, "tsconfig.json"));

addCheck({
  category: "TypeScript",
  name: "Configuración TypeScript",
  maximum: 2,
  earned: tsconfig ? 2 : 0,
  status: tsconfig ? "PASS" : "FAIL",
  details: tsconfig
    ? "tsconfig.json es válido."
    : "tsconfig.json no existe o no se pudo analizar.",
});

const strictEnabled =
  tsconfig?.compilerOptions?.strict === true;

addCheck({
  category: "TypeScript",
  name: "Modo strict",
  maximum: 2,
  earned: strictEnabled ? 2 : 0.5,
  status: strictEnabled ? "PASS" : "WARN",
  details: strictEnabled
    ? "compilerOptions.strict está activado."
    : "compilerOptions.strict no está activado.",
  recommendation: "Activa strict en tsconfig.json.",
});

const anyCount = countPattern(
  sourceFiles,
  /(?<![A-Za-z0-9_])any(?![A-Za-z0-9_])/g,
);

const anyScore =
  anyCount === 0
    ? 2
    : anyCount <= 5
      ? 1.5
      : anyCount <= 20
        ? 0.75
        : 0;

addCheck({
  category: "TypeScript",
  name: "Uso explícito de any",
  maximum: 2,
  earned: anyScore,
  status:
    anyScore === 2
      ? "PASS"
      : anyScore > 0
        ? "WARN"
        : "FAIL",
  details: `${anyCount} uso(s) potenciales de any.`,
  recommendation:
    "Sustituye any por interfaces, genéricos o unknown.",
});

if (tsconfig && hasNodeModules) {
  const typeCheck = run(
    "npx --no-install tsc --noEmit --pretty false",
    180000,
  );

  const typeErrors = (
    typeCheck.output.match(/error TS\d+/g) || []
  ).length;

  addCheck({
    category: "TypeScript",
    name: "Compilación de tipos",
    maximum: 8,
    earned: typeCheck.code === 0 ? 8 : 0,
    status: typeCheck.code === 0 ? "PASS" : "FAIL",
    details:
      typeCheck.code === 0
        ? `TypeScript terminó sin errores en ${typeCheck.durationSeconds}s.`
        : `${typeErrors} error(es) TypeScript detectados.`,
    recommendation:
      "Ejecuta npx tsc --noEmit y corrige todos los errores.",
  });
} else {
  addCheck({
    category: "TypeScript",
    name: "Compilación de tipos",
    maximum: 8,
    earned: 0,
    status: "SKIP",
    details:
      "No fue posible ejecutar TypeScript por falta de configuración o dependencias.",
  });
}

section("4/10 — LINT Y FORMATO");

const hasLintScript = Boolean(scripts.lint);

const hasLintConfig = anyExists([
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  ".eslintrc",
  ".eslintrc.json",
  ".eslintrc.js",
  ".eslintrc.cjs",
]);

const lintSetupScore =
  hasLintScript && hasLintConfig
    ? 2
    : hasLintScript || hasLintConfig
      ? 1
      : 0;

addCheck({
  category: "Lint",
  name: "Configuración ESLint",
  maximum: 2,
  earned: lintSetupScore,
  status:
    lintSetupScore === 2
      ? "PASS"
      : lintSetupScore > 0
        ? "WARN"
        : "FAIL",
  details:
    `Script lint: ${hasLintScript}. ` +
    `Configuración: ${hasLintConfig}.`,
});

if (hasLintScript && hasNodeModules) {
  const lint = run("npm run lint", 180000);

  addCheck({
    category: "Lint",
    name: "Ejecución ESLint",
    maximum: 8,
    earned: lint.code === 0 ? 8 : 0,
    status: lint.code === 0 ? "PASS" : "FAIL",
    details:
      lint.code === 0
        ? `Lint terminó correctamente en ${lint.durationSeconds}s.`
        : "npm run lint terminó con errores.",
    recommendation: "Ejecuta npm run lint y corrige los errores.",
  });
} else {
  addCheck({
    category: "Lint",
    name: "Ejecución ESLint",
    maximum: 8,
    earned: 0,
    status: "SKIP",
    details:
      "No existe script lint o faltan dependencias.",
  });
}

section("5/10 — COMPILACIÓN DE PRODUCCIÓN");

const hasBuildScript = Boolean(scripts.build);

addCheck({
  category: "Build",
  name: "Script de compilación",
  maximum: 2,
  earned: hasBuildScript ? 2 : 0,
  status: hasBuildScript ? "PASS" : "FAIL",
  details: hasBuildScript
    ? "npm run build está definido."
    : "No existe script build.",
});

if (options.skipBuild) {
  addCheck({
    category: "Build",
    name: "Build de producción",
    maximum: 11,
    earned: 0,
    status: "SKIP",
    details: "Build omitido mediante --skip-build.",
  });

  addCheck({
    category: "Build",
    name: "Advertencias del build",
    maximum: 2,
    earned: 0,
    status: "SKIP",
    details: "No se ejecutó el build.",
  });
} else if (hasBuildScript && hasNodeModules) {
  const build = run("npm run build", 360000);

  addCheck({
    category: "Build",
    name: "Build de producción",
    maximum: 11,
    earned: build.code === 0 ? 11 : 0,
    status: build.code === 0 ? "PASS" : "FAIL",
    details:
      build.code === 0
        ? `Build completado en ${build.durationSeconds}s.`
        : build.timedOut
          ? "El build excedió el tiempo máximo."
          : "npm run build terminó con errores.",
    recommendation: "Corrige todos los errores del build.",
  });

  const buildWarnings = (
    build.output.match(/\b(warning|warn|deprecated)\b/gi) || []
  ).length;

  const buildWarningScore =
    build.code !== 0
      ? 0
      : buildWarnings === 0
        ? 2
        : buildWarnings <= 3
          ? 1
          : 0;

  addCheck({
    category: "Build",
    name: "Advertencias del build",
    maximum: 2,
    earned: buildWarningScore,
    status:
      buildWarningScore === 2
        ? "PASS"
        : buildWarningScore > 0
          ? "WARN"
          : "FAIL",
    details: `${buildWarnings} advertencia(s) detectadas.`,
  });
} else {
  addCheck({
    category: "Build",
    name: "Build de producción",
    maximum: 11,
    earned: 0,
    status: "SKIP",
    details:
      "No existe script build o faltan dependencias.",
  });

  addCheck({
    category: "Build",
    name: "Advertencias del build",
    maximum: 2,
    earned: 0,
    status: "SKIP",
    details: "No se ejecutó el build.",
  });
}

section("6/10 — PRUEBAS AUTOMATIZADAS");

const hasTestScript = Boolean(scripts.test);

addCheck({
  category: "Pruebas",
  name: "Script de pruebas",
  maximum: 2,
  earned: hasTestScript ? 2 : 0,
  status: hasTestScript ? "PASS" : "FAIL",
  details: hasTestScript
    ? "npm test está configurado."
    : "No existe script test.",
});

const testFiles = allFiles.filter((file) =>
  /\.(test|spec)\.(ts|tsx|js|jsx)$/i.test(file),
);

const testFileScore =
  testFiles.length >= 10
    ? 2
    : testFiles.length >= 3
      ? 1.5
      : testFiles.length >= 1
        ? 0.75
        : 0;

addCheck({
  category: "Pruebas",
  name: "Archivos de prueba",
  maximum: 2,
  earned: testFileScore,
  status:
    testFileScore === 2
      ? "PASS"
      : testFileScore > 0
        ? "WARN"
        : "FAIL",
  details: `${testFiles.length} archivo(s) de prueba detectados.`,
});

if (options.skipTests) {
  addCheck({
    category: "Pruebas",
    name: "Ejecución de pruebas",
    maximum: 6,
    earned: 0,
    status: "SKIP",
    details: "Pruebas omitidas mediante --skip-tests.",
  });
} else if (hasTestScript && hasNodeModules) {
  let testCommand = "npm test";

  if (/vitest/i.test(scripts.test)) {
    testCommand = "npm test -- --run";
  } else if (/jest/i.test(scripts.test)) {
    testCommand = "npm test -- --runInBand";
  }

  const test = run(testCommand, 300000);

  addCheck({
    category: "Pruebas",
    name: "Ejecución de pruebas",
    maximum: 6,
    earned: test.code === 0 ? 6 : 0,
    status: test.code === 0 ? "PASS" : "FAIL",
    details:
      test.code === 0
        ? `Pruebas completadas en ${test.durationSeconds}s.`
        : "Las pruebas terminaron con errores.",
    recommendation: "Corrige las pruebas antes de desplegar.",
  });
} else {
  addCheck({
    category: "Pruebas",
    name: "Ejecución de pruebas",
    maximum: 6,
    earned: 0,
    status: "SKIP",
    details:
      "No existe script test o faltan dependencias.",
  });
}

const hasCoverage = Boolean(scripts["test:coverage"]) ||
  anyExists([
    "vitest.config.ts",
    "vitest.config.js",
    "jest.config.ts",
    "jest.config.js",
    "jest.config.mjs",
  ]);

addCheck({
  category: "Pruebas",
  name: "Configuración de cobertura",
  maximum: 2,
  earned: hasCoverage ? 2 : 0,
  status: hasCoverage ? "PASS" : "WARN",
  details: hasCoverage
    ? "Existe configuración de cobertura o test runner."
    : "No se detectó configuración de cobertura.",
});

section("7/10 — SEGURIDAD");

if (options.skipAudit) {
  addCheck({
    category: "Seguridad",
    name: "Auditoría de dependencias",
    maximum: 5,
    earned: 0,
    status: "SKIP",
    details: "Auditoría omitida mediante --skip-audit.",
  });
} else if (packageJson) {
  const audit = run(
    "npm audit --omit=dev --json",
    180000,
  );

  let auditJson = null;

  try {
    auditJson = JSON.parse(audit.output);
  } catch {
    auditJson = null;
  }

  const vulnerabilities =
    auditJson?.metadata?.vulnerabilities;

  if (vulnerabilities) {
    const critical = Number(vulnerabilities.critical || 0);
    const high = Number(vulnerabilities.high || 0);
    const moderate = Number(vulnerabilities.moderate || 0);
    const low = Number(vulnerabilities.low || 0);
    const total = Number(vulnerabilities.total || 0);

    const auditScore =
      critical > 0
        ? 0
        : high > 0
          ? 1
          : moderate > 0
            ? 3
            : low > 0
              ? 4
              : 5;

    addCheck({
      category: "Seguridad",
      name: "Auditoría de dependencias",
      maximum: 5,
      earned: auditScore,
      status:
        auditScore === 5
          ? "PASS"
          : auditScore >= 3
            ? "WARN"
            : "FAIL",
      details:
        `Total: ${total}. Críticas: ${critical}. ` +
        `Altas: ${high}. Moderadas: ${moderate}. ` +
        `Bajas: ${low}.`,
      recommendation:
        "Ejecuta npm audit fix y revisa las vulnerabilidades.",
    });
  } else {
    addCheck({
      category: "Seguridad",
      name: "Auditoría de dependencias",
      maximum: 5,
      earned: 1,
      status: "WARN",
      details:
        "npm audit no devolvió un JSON interpretable.",
    });
  }
} else {
  addCheck({
    category: "Seguridad",
    name: "Auditoría de dependencias",
    maximum: 5,
    earned: 0,
    status: "SKIP",
    details: "No existe package.json válido.",
  });
}

const secretPatterns = [
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z_-]{30,}/g,
  /ghp_[0-9A-Za-z]{30,}/g,
  /sk-[0-9A-Za-z_-]{20,}/g,
  /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /(?:api[_-]?key|secret|access[_-]?token)\s*[:=]\s*["'][^"'\r\n]{12,}["']/gi,
];

let secretHits = 0;

for (const pattern of secretPatterns) {
  secretHits += countPattern(scanFiles, pattern);
}

const secretScore =
  secretHits === 0
    ? 4
    : secretHits <= 2
      ? 1
      : 0;

addCheck({
  category: "Seguridad",
  name: "Secretos en código",
  maximum: 4,
  earned: secretScore,
  status:
    secretScore === 4
      ? "PASS"
      : secretScore > 0
        ? "WARN"
        : "FAIL",
  details: `${secretHits} coincidencia(s) potenciales.`,
  recommendation:
    "Mueve claves y tokens a variables de entorno.",
});

const dangerousApis = countPattern(
  sourceFiles,
  /\beval\s*\(|new\s+Function\s*\(|dangerouslySetInnerHTML/gi,
);

const dangerousScore =
  dangerousApis === 0
    ? 2
    : dangerousApis <= 2
      ? 1
      : 0;

addCheck({
  category: "Seguridad",
  name: "APIs potencialmente peligrosas",
  maximum: 2,
  earned: dangerousScore,
  status:
    dangerousScore === 2
      ? "PASS"
      : dangerousScore > 0
        ? "WARN"
        : "FAIL",
  details:
    `${dangerousApis} uso(s) de eval, Function ` +
    "o dangerouslySetInnerHTML.",
});

const trackedEnvironment = run(
  "git ls-files .env .env.local .env.production .env.development",
  20000,
);

const trackedEnvironmentFiles = trackedEnvironment.output
  .split(/\r?\n/)
  .map((item) => item.trim())
  .filter(Boolean);

addCheck({
  category: "Seguridad",
  name: "Variables privadas fuera de Git",
  maximum: 1,
  earned: trackedEnvironmentFiles.length === 0 ? 1 : 0,
  status:
    trackedEnvironmentFiles.length === 0
      ? "PASS"
      : "FAIL",
  details:
    `${trackedEnvironmentFiles.length} archivo(s) privados ` +
    "rastreados por Git.",
  recommendation:
    "Elimina los archivos .env privados del repositorio.",
});

section("8/10 — ACCESIBILIDAD");

let imageCount = 0;
let imageWithAltCount = 0;
let buttonCount = 0;
let accessibleButtonCount = 0;

for (const file of sourceFiles) {
  const text = readText(file);

  const images = [
    ...text.matchAll(/<(?:img|Image)\b([^>]*)>/gis),
  ];

  for (const image of images) {
    imageCount += 1;

    if (/\balt\s*=/.test(image[1] || "")) {
      imageWithAltCount += 1;
    }
  }

  const buttons = [
    ...text.matchAll(
      /<button\b([^>]*)>([\s\S]*?)<\/button>/gi,
    ),
  ];

  for (const button of buttons) {
    buttonCount += 1;

    const attributes = button[1] || "";
    const body = (button[2] || "")
      .replace(/<[^>]+>/g, " ")
      .trim();

    if (
      /\b(aria-label|title)\s*=/.test(attributes) ||
      /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(body)
    ) {
      accessibleButtonCount += 1;
    }
  }
}

const imageRatio =
  imageCount === 0
    ? 1
    : imageWithAltCount / imageCount;

addCheck({
  category: "Accesibilidad",
  name: "Texto alternativo",
  maximum: 2,
  earned: Number((2 * imageRatio).toFixed(2)),
  status:
    imageRatio === 1
      ? "PASS"
      : imageRatio >= 0.75
        ? "WARN"
        : "FAIL",
  details:
    `${imageWithAltCount} de ${imageCount} imágenes incluyen alt.`,
});

const buttonRatio =
  buttonCount === 0
    ? 1
    : accessibleButtonCount / buttonCount;

addCheck({
  category: "Accesibilidad",
  name: "Botones identificables",
  maximum: 2,
  earned: Number((2 * buttonRatio).toFixed(2)),
  status:
    buttonRatio === 1
      ? "PASS"
      : buttonRatio >= 0.75
        ? "WARN"
        : "FAIL",
  details:
    `${accessibleButtonCount} de ${buttonCount} botones ` +
    "tienen texto o etiqueta.",
});

const landmarks = countPattern(
  sourceFiles,
  /<(main|nav|header|footer|aside)\b/gi,
);

addCheck({
  category: "Accesibilidad",
  name: "Estructura semántica",
  maximum: 1,
  earned: landmarks >= 3 ? 1 : 0.5,
  status: landmarks >= 3 ? "PASS" : "WARN",
  details: `${landmarks} landmarks semánticos detectados.`,
});

const ariaCount = countPattern(
  sourceFiles,
  /\baria-[a-z-]+\s*=/gi,
);

addCheck({
  category: "Accesibilidad",
  name: "Atributos ARIA",
  maximum: 1,
  earned: ariaCount > 0 ? 1 : 0.5,
  status: ariaCount > 0 ? "PASS" : "WARN",
  details: `${ariaCount} atributo(s) ARIA detectados.`,
});

const hasUxBoundaries = anyExists([
  "app/loading.tsx",
  "app/error.tsx",
  "app/not-found.tsx",
  "src/app/loading.tsx",
  "src/app/error.tsx",
  "src/app/not-found.tsx",
]);

addCheck({
  category: "Accesibilidad",
  name: "Estados de carga y error",
  maximum: 1,
  earned: hasUxBoundaries ? 1 : 0,
  status: hasUxBoundaries ? "PASS" : "WARN",
  details: hasUxBoundaries
    ? "Se detectaron límites de carga o error."
    : "No se detectaron loading, error o not-found.",
});

section("9/10 — RENDIMIENTO");

const nativeImages = countPattern(
  sourceFiles,
  /<img\b/gi,
);

const nextImages = countPattern(
  sourceFiles,
  /<Image\b/g,
);

const imageOptimizationScore =
  nextImages > 0 && nativeImages === 0
    ? 2
    : nextImages > 0
      ? 1
      : nativeImages === 0
        ? 1
        : 0;

addCheck({
  category: "Rendimiento",
  name: "Optimización de imágenes",
  maximum: 2,
  earned: imageOptimizationScore,
  status:
    imageOptimizationScore === 2
      ? "PASS"
      : imageOptimizationScore > 0
        ? "WARN"
        : "FAIL",
  details:
    `next/image: ${nextImages}. img nativo: ${nativeImages}.`,
});

const largeAssets = allFiles
  .map((file) => {
    try {
      return {
        file,
        size: fs.statSync(file).size,
      };
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .filter(
    (item) =>
      relative(item.file).startsWith("public") &&
      item.size > 2 * 1024 * 1024,
  );

const assetScore =
  largeAssets.length === 0
    ? 2
    : largeAssets.length <= 3
      ? 1
      : 0;

addCheck({
  category: "Rendimiento",
  name: "Activos pesados",
  maximum: 2,
  earned: assetScore,
  status:
    assetScore === 2
      ? "PASS"
      : assetScore > 0
        ? "WARN"
        : "FAIL",
  details:
    `${largeAssets.length} archivo(s) públicos superan 2 MB.`,
  recommendation:
    "Comprime imágenes, audio, video y fuentes.",
});

addCheck({
  category: "Rendimiento",
  name: "Complejidad de módulos",
  maximum: 1,
  earned:
    largeSourceFiles.length === 0
      ? 1
      : largeSourceFiles.length <= 3
        ? 0.5
        : 0,
  status:
    largeSourceFiles.length === 0
      ? "PASS"
      : largeSourceFiles.length <= 3
        ? "WARN"
        : "FAIL",
  details:
    `${largeSourceFiles.length} módulo(s) superan 600 líneas.`,
});

const dynamicImports = countPattern(
  sourceFiles,
  /\bdynamic\s*\(|\bimport\s*\(/g,
);

addCheck({
  category: "Rendimiento",
  name: "Carga diferida",
  maximum: 1,
  earned: dynamicImports > 0 ? 1 : 0.4,
  status: dynamicImports > 0 ? "PASS" : "WARN",
  details:
    `${dynamicImports} importación(es) dinámicas detectadas.`,
});

const nextFontCount = countPattern(
  sourceFiles,
  /from\s+["']next\/font\//g,
);

addCheck({
  category: "Rendimiento",
  name: "Optimización de fuentes",
  maximum: 1,
  earned: nextFontCount > 0 ? 1 : 0.4,
  status: nextFontCount > 0 ? "PASS" : "WARN",
  details:
    `${nextFontCount} uso(s) de next/font detectados.`,
});

section("10/10 — PREPARACIÓN PARA PRODUCCIÓN");

const hasReadme = anyExists([
  "README.md",
  "readme.md",
]);

addCheck({
  category: "Producción",
  name: "Documentación README",
  maximum: 1,
  earned: hasReadme ? 1 : 0,
  status: hasReadme ? "PASS" : "WARN",
  details: hasReadme
    ? "README encontrado."
    : "No existe README.md.",
});

const hasEnvironmentExample = anyExists([
  ".env.example",
  ".env.sample",
  ".env.template",
]);

addCheck({
  category: "Producción",
  name: "Plantilla de variables",
  maximum: 1,
  earned: hasEnvironmentExample ? 1 : 0,
  status: hasEnvironmentExample ? "PASS" : "WARN",
  details: hasEnvironmentExample
    ? "Existe una plantilla de variables."
    : "No existe .env.example.",
});

const metadataCount = countPattern(
  sourceFiles,
  /\bmetadata\s*(?:=|:)/g,
);

addCheck({
  category: "Producción",
  name: "Metadatos SEO",
  maximum: 1,
  earned: metadataCount > 0 ? 1 : 0,
  status: metadataCount > 0 ? "PASS" : "WARN",
  details:
    `${metadataCount} definición(es) de metadata detectadas.`,
});

const hasErrorPages = anyExists([
  "app/error.tsx",
  "app/global-error.tsx",
  "app/not-found.tsx",
  "src/app/error.tsx",
  "src/app/global-error.tsx",
  "src/app/not-found.tsx",
  "pages/404.tsx",
  "pages/500.tsx",
]);

addCheck({
  category: "Producción",
  name: "Páginas de error",
  maximum: 1,
  earned: hasErrorPages ? 1 : 0,
  status: hasErrorPages ? "PASS" : "WARN",
  details: hasErrorPages
    ? "Se detectaron páginas de error."
    : "No se detectaron páginas de error personalizadas.",
});

const hasCi = anyExists([
  ".github/workflows",
  "azure-pipelines.yml",
  ".gitlab-ci.yml",
  "bitbucket-pipelines.yml",
]);

addCheck({
  category: "Producción",
  name: "Integración continua",
  maximum: 1,
  earned: hasCi ? 1 : 0,
  status: hasCi ? "PASS" : "WARN",
  details: hasCi
    ? "Se detectó configuración CI."
    : "No se detectó pipeline CI.",
});

section("RESULTADOS DETALLADOS");

const categoryOrder = [
  "Entorno",
  "Arquitectura",
  "TypeScript",
  "Lint",
  "Build",
  "Pruebas",
  "Seguridad",
  "Accesibilidad",
  "Rendimiento",
  "Producción",
];

for (const category of categoryOrder) {
  console.log("");
  console.log(color(category.toUpperCase(), colors.cyan));

  for (const check of checks.filter(
    (item) => item.category === category,
  )) {
    printCheck(check);
  }
}

const totalEarned = checks.reduce(
  (total, check) => total + check.earned,
  0,
);

const totalMaximum = checks.reduce(
  (total, check) => total + check.maximum,
  0,
);

const finalScore = Number(
  ((totalEarned / totalMaximum) * 10).toFixed(2),
);

const finalPercentage = Number(
  ((totalEarned / totalMaximum) * 100).toFixed(1),
);

const grade = getGrade(finalScore);
const passed = finalScore >= options.minimumScore;

const categories = categoryOrder.map((category) => {
  const categoryChecks = checks.filter(
    (item) => item.category === category,
  );

  const earned = categoryChecks.reduce(
    (total, item) => total + item.earned,
    0,
  );

  const maximum = categoryChecks.reduce(
    (total, item) => total + item.maximum,
    0,
  );

  return {
    category,
    earned: Number(earned.toFixed(2)),
    maximum: Number(maximum.toFixed(2)),
    score: Number(((earned / maximum) * 10).toFixed(2)),
    percentage: Number(
      ((earned / maximum) * 100).toFixed(1),
    ),
  };
});

const report = {
  scannerVersion: "2.0.0",
  project: root,
  generatedAt: new Date().toISOString(),
  options,
  passed,
  finalScore,
  finalPercentage,
  grade,
  totalEarned: Number(totalEarned.toFixed(2)),
  totalMaximum: Number(totalMaximum.toFixed(2)),
  categories,
  checks,
  largeSourceFiles,
  backupFiles: backupFiles.map(relative),
  largeAssets: largeAssets.map((item) => ({
    file: relative(item.file),
    sizeMB: Number(
      (item.size / 1024 / 1024).toFixed(2),
    ),
  })),
};

fs.mkdirSync(reportDirectory, {
  recursive: true,
});

const jsonPath = path.join(
  reportDirectory,
  `quality-report-${timestamp}.json`,
);

const csvPath = path.join(
  reportDirectory,
  `quality-report-${timestamp}.csv`,
);

const markdownPath = path.join(
  reportDirectory,
  `quality-report-${timestamp}.md`,
);

const latestJsonPath = path.join(
  reportDirectory,
  "latest.json",
);

const latestMarkdownPath = path.join(
  reportDirectory,
  "latest.md",
);

const jsonText = JSON.stringify(report, null, 2);

fs.writeFileSync(jsonPath, jsonText, "utf8");
fs.writeFileSync(latestJsonPath, jsonText, "utf8");

const csvHeaders = [
  "Category",
  "Name",
  "Status",
  "Earned",
  "Maximum",
  "Percentage",
  "Details",
  "Recommendation",
];

const csvLines = [
  csvHeaders.join(","),
  ...checks.map((check) =>
    [
      check.category,
      check.name,
      check.status,
      check.earned,
      check.maximum,
      check.percentage,
      check.details,
      check.recommendation,
    ]
      .map(csvEscape)
      .join(","),
  ),
];

fs.writeFileSync(
  csvPath,
  csvLines.join("\n"),
  "utf8",
);

const markdown = [];

markdown.push("# Reporte de calidad del proyecto");
markdown.push("");
markdown.push(`- **Proyecto:** \`${root}\``);
markdown.push(
  `- **Generado:** ${new Date().toLocaleString()}`,
);
markdown.push(
  `- **Puntuación:** **${finalScore}/10.0**`,
);
markdown.push(
  `- **Porcentaje:** **${finalPercentage}%**`,
);
markdown.push(`- **Calificación:** **${grade}**`);
markdown.push(
  `- **Resultado:** **${
    passed ? "APROBADO" : "NO APROBADO"
  }**`,
);
markdown.push("");
markdown.push("## Resumen por categoría");
markdown.push("");
markdown.push(
  "| Categoría | Puntuación | Porcentaje |",
);
markdown.push("|---|---:|---:|");

for (const category of categories) {
  markdown.push(
    `| ${category.category} | ` +
      `${category.score}/10 | ` +
      `${category.percentage}% |`,
  );
}

markdown.push("");
markdown.push("## Revisiones");
markdown.push("");
markdown.push(
  "| Categoría | Revisión | Estado | Puntos | Detalles |",
);
markdown.push("|---|---|---|---:|---|");

for (const check of checks) {
  markdown.push(
    `| ${check.category} | ` +
      `${check.name} | ` +
      `${check.status} | ` +
      `${check.earned}/${check.maximum} | ` +
      `${check.details.replaceAll("|", "\\|")} |`,
  );
}

markdown.push("");
markdown.push("## Mejoras prioritarias");
markdown.push("");

const priorities = checks
  .filter(
    (check) =>
      check.status === "FAIL" ||
      check.status === "WARN",
  )
  .sort(
    (a, b) =>
      b.maximum -
      b.earned -
      (a.maximum - a.earned),
  )
  .slice(0, 15);

if (priorities.length === 0) {
  markdown.push(
    "No se detectaron mejoras prioritarias.",
  );
} else {
  priorities.forEach((check, index) => {
    markdown.push(
      `${index + 1}. **${check.name}:** ` +
        `${
          check.recommendation ||
          check.details
        }`,
    );
  });
}

const markdownText = markdown.join("\n");

fs.writeFileSync(
  markdownPath,
  markdownText,
  "utf8",
);

fs.writeFileSync(
  latestMarkdownPath,
  markdownText,
  "utf8",
);

section("PUNTUACIÓN FINAL");

const finalColor =
  finalScore >= 9
    ? colors.green
    : finalScore >= 8
      ? colors.cyan
      : finalScore >= 7
        ? colors.yellow
        : colors.red;

console.log("");
console.log(
  `  Puntuación:   ${color(
    `${finalScore}/10.0`,
    finalColor,
  )}`,
);
console.log(
  `  Porcentaje:   ${color(
    `${finalPercentage}%`,
    finalColor,
  )}`,
);
console.log(
  `  Calificación: ${color(grade, finalColor)}`,
);
console.log(
  `  Resultado:    ${color(
    passed ? "APROBADO" : "NO APROBADO",
    passed ? colors.green : colors.red,
  )}`,
);

console.log("");
console.log(color("  Resumen por categoría:", colors.cyan));
console.log("");

for (const category of categories) {
  console.log(
    `  ${category.category.padEnd(18)} ` +
      `${String(category.score).padStart(5)}/10  ` +
      `${String(category.percentage).padStart(5)}%`,
  );
}

console.log("");
console.log(color("  Reportes generados:", colors.cyan));
console.log(`  ${jsonPath}`);
console.log(`  ${csvPath}`);
console.log(`  ${markdownPath}`);
console.log("");

process.exitCode = passed ? 0 : 1;