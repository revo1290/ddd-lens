import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanRepository } from "../src/scanner.js";

describe("scanRepository", () => {
  it("classifies files and honors exclusions and size limits", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ddd-lens-scan-"));
    await mkdir(path.join(root, "src", "domain"), { recursive: true });
    await mkdir(path.join(root, "generated"), { recursive: true });
    await writeFile(path.join(root, "src", "domain", "Order.ts"), "export class Order {}", "utf8");
    await writeFile(path.join(root, "src", "domain", "Order.test.ts"), "test('order', () => {})", "utf8");
    await writeFile(path.join(root, "generated", "Ignored.ts"), "generated", "utf8");
    await writeFile(path.join(root, "README.md"), "x".repeat(100), "utf8");

    const result = await scanRepository(root, {
      version: 1,
      scan: { exclude: ["**/generated/**"], maxFileBytes: 50 }
    });

    expect(result.files.map((file) => file.relativePath)).toEqual([
      "src/domain/Order.test.ts",
      "src/domain/Order.ts"
    ]);
    expect(result.files[0]?.category).toBe("test");
    expect(result.files[1]?.category).toBe("source");
    expect(result.stats.skippedLargeFiles).toBe(1);
  });
});
