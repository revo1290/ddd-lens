import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import type { LensConfig, ScanContext, ScannedFile } from "./types.js";

const DEFAULT_INCLUDE = [
  "**/*.{ts,tsx,js,jsx,mjs,cjs,java,kt,kts,cs,go,py,rb,rs,php,scala}",
  "**/*.{md,mdx,adoc,txt,cml,yml,yaml,json,toml,xml,gradle,properties}"
];
const DEFAULT_EXCLUDE = [
  "**/.git/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/target/**",
  "**/coverage/**",
  "**/.next/**",
  "**/vendor/**",
  "**/*.min.js",
  "**/package-lock.json",
  "**/pnpm-lock.yaml",
  "**/yarn.lock"
];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".java", ".kt", ".kts", ".cs", ".go", ".py", ".rb", ".rs", ".php", ".scala"]);
const TEST_PATTERN = /(?:^|\/)(?:test|tests|spec|specs|__tests__)(?:\/|$)|(?:\.test|\.spec|Test)\.[^.]+$/i;
const CONFIG_PATTERN = /(?:^|\/)(?:pom\.xml|build\.gradle(?:\.kts)?|package\.json|pyproject\.toml|go\.mod|Cargo\.toml|CODEOWNERS|.*\.(?:ya?ml|json|toml|properties))$/i;

function categorize(relativePath: string): ScannedFile["category"] {
  if (TEST_PATTERN.test(relativePath)) return "test";
  if (CONFIG_PATTERN.test(relativePath)) return "config";
  return SOURCE_EXTENSIONS.has(path.extname(relativePath)) ? "source" : "document";
}

export async function scanRepository(root: string, config: LensConfig): Promise<ScanContext> {
  const started = Date.now();
  const resolvedRoot = path.resolve(root);
  const maxFiles = config.scan?.maxFiles ?? 5000;
  const maxFileBytes = config.scan?.maxFileBytes ?? 512 * 1024;
  const matches = await fg(config.scan?.include ?? DEFAULT_INCLUDE, {
    cwd: resolvedRoot,
    ignore: [...DEFAULT_EXCLUDE, ...(config.scan?.exclude ?? [])],
    onlyFiles: true,
    unique: true,
    dot: false,
    followSymbolicLinks: false
  });
  matches.sort((a, b) => a.localeCompare(b));
  const selected = matches.slice(0, maxFiles);
  let skippedLargeFiles = 0;
  const files: ScannedFile[] = [];

  for (const relativePath of selected) {
    const absolutePath = path.join(resolvedRoot, relativePath);
    const fileStat = await stat(absolutePath);
    if (fileStat.size > maxFileBytes) {
      skippedLargeFiles += 1;
      continue;
    }
    files.push({
      relativePath: relativePath.split(path.sep).join("/"),
      absolutePath,
      category: categorize(relativePath),
      content: await readFile(absolutePath, "utf8")
    });
  }

  return {
    root: resolvedRoot,
    files,
    stats: {
      root: resolvedRoot,
      filesScanned: files.length,
      sourceFiles: files.filter((file) => file.category === "source").length,
      documentFiles: files.filter((file) => file.category === "document").length,
      skippedLargeFiles,
      truncatedByLimit: matches.length > maxFiles,
      durationMs: Date.now() - started
    }
  };
}
