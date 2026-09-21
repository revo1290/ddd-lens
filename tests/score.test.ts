import { describe, expect, it } from "vitest";
import { buildReport } from "../src/score.js";
import { CRITERIA } from "../src/catalog.js";
import type { DetectorOutput, LensConfig, ScanStats } from "../src/types.js";

const stats: ScanStats = {
  root: "/repo/sample",
  filesScanned: 10,
  sourceFiles: 6,
  documentFiles: 2,
  skippedLargeFiles: 0,
  truncatedByLimit: false,
  durationMs: 12
};

function detectors(score: number | null): DetectorOutput[] {
  return CRITERIA.map((criterion) => ({
    criterionId: criterion.id,
    score,
    confidence: "low",
    rationale: "test",
    evidence: [],
    findings: []
  }));
}

describe("buildReport", () => {
  it("does not pretend unknown criteria are failures", () => {
    const report = buildReport({ version: 1 }, detectors(null), stats, "test", new Date("2026-01-01T00:00:00Z"));
    expect(report.adoption.score).toBeNull();
    expect(report.adoption.evidenceCoverage).toBe(0);
    expect(report.adoption.label).toContain("根拠不足");
  });

  it("keeps DDD fit separate from adoption", () => {
    const config: LensConfig = {
      version: 1,
      fit: {
        businessRuleComplexity: 1,
        differentiation: 0,
        changeFrequency: 1,
        integrationComplexity: 1,
        domainExpertAccess: 3
      }
    };
    const report = buildReport(config, detectors(4), stats);
    expect(report.fit.recommendation).toBe("not-recommended");
    expect(report.adoption.score).toBe(100);
    expect(report.adoption.evidenceCoverage).toBe(25);
    expect(report.adoption.label).toContain("根拠不足");
  });

  it("manual evidence overrides a weak automatic signal", () => {
    const config: LensConfig = {
      version: 1,
      assessment: {
        "strategy.context-map": {
          score: 4,
          confidence: "high",
          rationale: "Quarterly review with domain experts",
          evidence: [{ kind: "workshop", note: "reviewed" }]
        }
      }
    };
    const report = buildReport(config, detectors(1), stats);
    const result = report.criteria.find((item) => item.id === "strategy.context-map");
    expect(result?.score).toBe(4);
    expect(result?.source).toBe("combined");
    expect(result?.confidence).toBe("high");
  });

  it("recommends DDD when complex differentiating work has evidence", () => {
    const report = buildReport({
      version: 1,
      fit: {
        businessRuleComplexity: 4,
        differentiation: 4,
        changeFrequency: 3,
        integrationComplexity: 3,
        domainExpertAccess: 1
      }
    }, detectors(null), stats);
    expect(report.fit.recommendation).toBe("recommended");
    expect(report.fit.readinessWarning).toBe(true);
  });

  it("withholds fit when too few factors are known", () => {
    const report = buildReport({ version: 1, fit: { differentiation: 4 } }, detectors(null), stats);
    expect(report.fit.recommendation).toBe("insufficient-evidence");
  });

  it("treats null template answers as unknown rather than zero", () => {
    const report = buildReport({
      version: 1,
      fit: {
        businessRuleComplexity: null,
        differentiation: null,
        changeFrequency: null,
        integrationComplexity: null,
        domainExpertAccess: null
      }
    }, detectors(null), stats);
    expect(report.fit.recommendation).toBe("insufficient-evidence");
    expect(report.fit.score).toBeNull();
    expect(report.fit.readinessWarning).toBe(false);
  });
});
