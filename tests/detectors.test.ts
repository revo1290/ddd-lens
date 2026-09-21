import { describe, expect, it } from "vitest";
import { runDetectors } from "../src/detectors.js";
import type { ScanContext, ScannedFile } from "../src/types.js";

function context(files: Array<Pick<ScannedFile, "relativePath" | "category" | "content">>): ScanContext {
  return {
    root: "/repo",
    files: files.map((file) => ({ ...file, absolutePath: `/repo/${file.relativePath}` })),
    stats: {
      root: "/repo",
      filesScanned: files.length,
      sourceFiles: files.filter((file) => file.category === "source").length,
      documentFiles: files.filter((file) => file.category === "document").length,
      skippedLargeFiles: 0,
      truncatedByLimit: false,
      durationMs: 1
    }
  };
}

describe("runDetectors", () => {
  it("reports an anemic-model signal conservatively", () => {
    const source = `class Order {
      getId() {}
      setId() {}
      getStatus() {}
      setStatus() {}
    }`;
    const results = runDetectors(context([{ relativePath: "src/domain/Order.java", category: "source", content: source }]));
    const behavior = results.find((item) => item.criterionId === "model.behavior");
    expect(behavior?.score).toBe(1);
    expect(behavior?.confidence).toBe("low");
    expect(behavior?.findings[0]?.ruleId).toBe("DDD-MODEL-001");
  });

  it("finds explicit architecture enforcement", () => {
    const results = runDetectors(context([{
      relativePath: "src/test/ArchitectureTest.java",
      category: "test",
      content: "ApplicationModules.of(App.class).verify(); // SpringModulith"
    }]));
    expect(results.find((item) => item.criterionId === "boundaries.enforcement")?.score).toBe(2);
  });

  it("does not award full scores for keyword presence", () => {
    const results = runDetectors(context([{
      relativePath: "docs/context-map.md",
      category: "document",
      content: "# Context Map\nOrdering is upstream of Shipping."
    }]));
    expect(results.find((item) => item.criterionId === "strategy.context-map")?.score).toBe(2);
  });
});
