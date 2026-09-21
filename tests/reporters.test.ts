import { describe, expect, it } from "vitest";
import { renderJson, renderMarkdown, renderText } from "../src/reporters.js";
import { renderSarif } from "../src/sarif.js";
import type { AssessmentReport } from "../src/types.js";

const report: AssessmentReport = {
  schemaVersion: "1.0",
  tool: { name: "ddd-lens", version: "test" },
  generatedAt: "2026-01-01T00:00:00.000Z",
  projectName: "sample",
  fit: { recommendation: "selective", score: 50, readinessWarning: false, rationale: "test" },
  adoption: { score: 42, label: "局所的・部分適用", evidenceCoverage: 50, dimensions: [] },
  criteria: [],
  findings: [{
    ruleId: "DDD-X-001",
    severity: "high",
    confidence: "medium",
    title: "risk",
    message: "problem",
    advice: "fix",
    evidence: [{ kind: "code", path: "src/domain/A.java", line: 3, note: "import x" }]
  }],
  limitations: ["limit"],
  stats: { root: "/repo", filesScanned: 1, sourceFiles: 1, documentFiles: 0, skippedLargeFiles: 0, truncatedByLimit: false, durationMs: 1 }
};

describe("reporters", () => {
  it("renders honest coverage in markdown", () => {
    expect(renderMarkdown(report)).toContain("確度加重カバレッジ: **50%**");
  });

  it("renders valid SARIF with a physical location", () => {
    const sarif = JSON.parse(renderSarif(report)) as { runs: Array<{ results: Array<{ locations: unknown[] }> }> };
    expect(sarif.runs[0]?.results[0]?.locations).toHaveLength(1);
  });

  it("renders text and machine-readable JSON", () => {
    expect(renderText(report)).toContain("適用妥当性: 選択的適用");
    expect((JSON.parse(renderJson(report)) as AssessmentReport).projectName).toBe("sample");
  });

  it("maps medium and low findings to SARIF levels", () => {
    const expanded: AssessmentReport = {
      ...report,
      findings: [
        { ...report.findings[0]!, severity: "medium", ruleId: "M" },
        { ...report.findings[0]!, severity: "low", ruleId: "L", evidence: [] }
      ]
    };
    const sarif = JSON.parse(renderSarif(expanded)) as { runs: Array<{ results: Array<{ level: string }> }> };
    expect(sarif.runs[0]?.results.map((item) => item.level)).toEqual(["warning", "note"]);
  });
});
