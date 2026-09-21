import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("loads a valid configuration", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ddd-lens-"));
    await writeFile(path.join(root, ".ddd-lens.yml"), "version: 1\nfit:\n  differentiation: 4\n", "utf8");
    const result = await loadConfig(root);
    expect(result.config.fit?.differentiation).toBe(4);
  });

  it("rejects scores outside 0..4", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ddd-lens-"));
    await writeFile(path.join(root, ".ddd-lens.yml"), "version: 1\nfit:\n  differentiation: 5\n", "utf8");
    await expect(loadConfig(root)).rejects.toThrow("0〜4");
  });

  it("uses an empty versioned config when no file exists", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ddd-lens-"));
    expect((await loadConfig(root)).config).toEqual({ version: 1 });
  });

  it("fails when an explicit file is missing", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ddd-lens-"));
    await expect(loadConfig(root, "missing.yml")).rejects.toThrow("見つかりません");
  });
});
