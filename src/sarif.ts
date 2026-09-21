import type { AssessmentReport, Finding } from "./types.js";

function level(finding: Finding): "error" | "warning" | "note" {
  if (finding.severity === "critical" || finding.severity === "high") return "error";
  if (finding.severity === "medium") return "warning";
  return "note";
}

export function renderSarif(report: AssessmentReport): string {
  const rules = [...new Map(report.findings.map((finding) => [finding.ruleId, finding])).values()].map((finding) => ({
    id: finding.ruleId,
    shortDescription: { text: finding.title },
    fullDescription: { text: finding.message },
    help: { text: finding.advice }
  }));
  const results = report.findings.map((finding) => {
    const evidence = finding.evidence.find((item) => item.path);
    return {
      ruleId: finding.ruleId,
      level: level(finding),
      message: { text: `${finding.message} 改善: ${finding.advice}` },
      ...(evidence?.path ? {
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: evidence.path },
            ...(evidence.line ? { region: { startLine: evidence.line } } : {})
          }
        }]
      } : {})
    };
  });
  return `${JSON.stringify({
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [{
      tool: { driver: { name: "ddd-lens", version: report.tool.version, informationUri: "https://github.com/revo1290/ddd-lens", rules } },
      results
    }]
  }, null, 2)}\n`;
}
