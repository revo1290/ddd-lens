const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
function value(score) {
    return score === null ? "未評価" : `${score}/4`;
}
function fitLabel(report) {
    const labels = {
        recommended: "適用推奨",
        selective: "選択的適用",
        "not-recommended": "適用非推奨",
        "insufficient-evidence": "判定保留"
    };
    return labels[report.fit.recommendation];
}
function keyRisks(report, max = 5) {
    return [...report.findings]
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
        .slice(0, max)
        .map((finding) => `- [${finding.severity.toUpperCase()} / 確信度:${finding.confidence}] ${finding.title}: ${finding.message}\n  - 改善: ${finding.advice}`);
}
export function renderMarkdown(report) {
    const score = report.adoption.score === null ? "未評価" : `${report.adoption.score}/100`;
    const dimensionRows = report.adoption.dimensions
        .map((dimension) => `| ${dimension.title} | ${dimension.score === null ? "未評価" : dimension.score} | ${dimension.coverage}% |`)
        .join("\n");
    const criterionRows = report.criteria
        .map((criterion) => `| \`${criterion.id}\` | ${criterion.title} | ${value(criterion.score)} | ${criterion.confidence} | ${criterion.source} |`)
        .join("\n");
    const risks = keyRisks(report);
    return `# DDD Lens 評価レポート: ${report.projectName}

> 生成日時: ${report.generatedAt}  
> 自動検出は設計レビューの代替ではありません。確信度と根拠カバレッジを必ず併読してください。

## 結論

- DDD適用妥当性: **${fitLabel(report)}**${report.fit.score === null ? "" : ` (${report.fit.score}/100)`}
- DDD適用度: **${score} — ${report.adoption.label}**
- 確度加重カバレッジ: **${report.adoption.evidenceCoverage}%**
${report.fit.readinessWarning ? "- 警告: ドメイン専門家へのアクセスが不足しています。モデルの正しさを検証できない状態です。\n" : ""}
${report.fit.rationale}

## 評価軸

| 評価軸 | スコア / 100 | 確度加重カバレッジ |
| --- | ---: | ---: |
${dimensionRows}

## 重要な指摘

${risks.length === 0 ? "重大な自動検出事項はありません。ただし未評価項目を問題なしとは扱わないでください。" : risks.join("\n")}

## 評価項目

| ID | 項目 | スコア | 確信度 | 根拠 |
| --- | --- | ---: | --- | --- |
${criterionRows}

## 限界

${report.limitations.map((item) => `- ${item}`).join("\n")}

## 走査情報

- 対象: \`${report.stats.root}\`
- 走査ファイル: ${report.stats.filesScanned}（ソース ${report.stats.sourceFiles}、文書 ${report.stats.documentFiles}）
- 大容量のため除外: ${report.stats.skippedLargeFiles}
- ファイル数上限到達: ${report.stats.truncatedByLimit ? "はい" : "いいえ"}
`;
}
function criterionLine(criterion) {
    const score = criterion.score === null ? "?" : String(criterion.score);
    return `  ${criterion.id.padEnd(30)} ${score}/4  ${criterion.confidence.padEnd(6)} ${criterion.title}`;
}
export function renderText(report) {
    const lines = [
        `DDD Lens — ${report.projectName}`,
        `適用妥当性: ${fitLabel(report)}${report.fit.score === null ? "" : ` (${report.fit.score}/100)`}`,
        `適用度: ${report.adoption.score ?? "?"}/100 — ${report.adoption.label}`,
        `確度加重カバレッジ: ${report.adoption.evidenceCoverage}%`,
        "",
        "評価軸:"
    ];
    for (const dimension of report.adoption.dimensions) {
        lines.push(`  ${dimension.title.padEnd(12)} ${String(dimension.score ?? "?").padStart(3)}/100  coverage ${dimension.coverage}%`);
    }
    lines.push("", "項目:", ...report.criteria.map(criterionLine));
    if (report.findings.length > 0) {
        lines.push("", "重要な指摘:", ...keyRisks(report));
    }
    lines.push("", "注意: 未評価は合格ではありません。自動検出結果は人による根拠確認が必要です。");
    return `${lines.join("\n")}\n`;
}
export function renderJson(report) {
    return `${JSON.stringify(report, null, 2)}\n`;
}
//# sourceMappingURL=reporters.js.map