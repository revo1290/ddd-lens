import { CRITERIA, DIMENSIONS } from "./catalog.js";
import type {
  AssessmentReport,
  CriterionResult,
  DetectorOutput,
  DimensionScore,
  FitAnswers,
  FitResult,
  LensConfig,
  ScanStats
} from "./types.js";

function clampScore(value: number): number {
  return Math.max(0, Math.min(4, value));
}

const CONFIDENCE_COVERAGE = { high: 1, medium: 0.6, low: 0.25 } as const;

function evaluateFit(fit?: FitAnswers): FitResult {
  const strategic = [fit?.businessRuleComplexity, fit?.differentiation, fit?.changeFrequency, fit?.integrationComplexity]
    .filter((value): value is number => typeof value === "number");
  if (strategic.length < 3) {
    return {
      recommendation: "insufficient-evidence",
      score: null,
      readinessWarning: typeof fit?.domainExpertAccess === "number" && fit.domainExpertAccess <= 1,
      rationale: "DDDの必要性を判断する情報が不足しています。適用度とは別に、事業複雑性と差別化価値を確認してください。"
    };
  }
  const average = strategic.reduce((sum, value) => sum + value, 0) / strategic.length;
  const recommendation = average >= 2.75 ? "recommended" : average >= 1.75 ? "selective" : "not-recommended";
  const readinessWarning = typeof fit?.domainExpertAccess === "number" && fit.domainExpertAccess <= 1;
  const rationale = recommendation === "recommended"
    ? "複雑な業務判断や差別化領域があり、DDDへの投資が妥当な可能性が高いです。"
    : recommendation === "selective"
      ? "全面適用ではなく、複雑性と差別化が集中する領域だけにDDDを適用するのが妥当です。"
      : "現時点ではDDDの追加コストが便益を上回る可能性があります。単純なCRUDや既製機能を優先してください。";
  return { recommendation, score: Math.round((average / 4) * 100), readinessWarning, rationale };
}

function mergeCriterion(config: LensConfig, automatic: DetectorOutput): CriterionResult {
  const definition = CRITERIA.find((item) => item.id === automatic.criterionId);
  if (!definition) throw new Error(`未知の評価項目です: ${automatic.criterionId}`);
  const manual = config.assessment?.[automatic.criterionId];
  if (!manual) {
    return {
      id: definition.id,
      dimension: definition.dimension,
      title: definition.title,
      score: automatic.score,
      confidence: automatic.confidence,
      source: automatic.score === null ? "none" : "automatic",
      notApplicable: false,
      evidence: automatic.evidence,
      rationale: automatic.rationale
    };
  }
  if (manual.notApplicable) {
    return {
      id: definition.id,
      dimension: definition.dimension,
      title: definition.title,
      score: null,
      confidence: manual.confidence ?? "medium",
      source: "manual",
      notApplicable: true,
      evidence: manual.evidence ?? [],
      rationale: manual.rationale ?? "このプロジェクトには適用しないと判断されています"
    };
  }
  return {
    id: definition.id,
    dimension: definition.dimension,
    title: definition.title,
    score: manual.score === null ? automatic.score : clampScore(manual.score),
    confidence: manual.confidence ?? "medium",
    source: automatic.score === null ? "manual" : "combined",
    notApplicable: false,
    evidence: [...automatic.evidence, ...(manual.evidence ?? [])],
    rationale: manual.rationale ?? automatic.rationale
  };
}

function dimensionScores(criteria: CriterionResult[]): DimensionScore[] {
  return DIMENSIONS.map((dimension) => {
    const definitions = CRITERIA.filter((item) => item.dimension === dimension.id);
    const applicable = definitions.filter((definition) => !criteria.find((result) => result.id === definition.id)?.notApplicable);
    const assessed = applicable.filter((definition) => criteria.find((result) => result.id === definition.id)?.score !== null);
    const totalWeight = assessed.reduce((sum, definition) => sum + definition.weight, 0);
    const weighted = assessed.reduce((sum, definition) => {
      const result = criteria.find((item) => item.id === definition.id);
      return sum + (result?.score ?? 0) * definition.weight;
    }, 0);
    return {
      id: dimension.id,
      title: dimension.title,
      score: totalWeight === 0 ? null : Math.round((weighted / totalWeight / 4) * 100),
      coverage: applicable.length === 0 ? 100 : Math.round((assessed.reduce((sum, definition) => {
        const result = criteria.find((item) => item.id === definition.id);
        return sum + (result ? CONFIDENCE_COVERAGE[result.confidence] : 0);
      }, 0) / applicable.length) * 100)
    };
  });
}

function adoptionLabel(score: number | null, coverage: number): string {
  if (score === null || coverage < 40) return "判定保留（根拠不足）";
  if (score < 25) return "名称先行または未適用";
  if (score < 50) return "局所的・部分適用";
  if (score < 75) return "一貫した運用へ移行中";
  return "一貫運用・継続進化";
}

export function buildReport(
  config: LensConfig,
  detectors: DetectorOutput[],
  stats: ScanStats,
  version = "0.1.0",
  now = new Date()
): AssessmentReport {
  const criteria = detectors.map((detector) => mergeCriterion(config, detector));
  const dimensions = dimensionScores(criteria);
  const applicable = criteria.filter((item) => !item.notApplicable);
  const assessed = applicable.filter((item) => item.score !== null);
  const evidenceCoverage = applicable.length === 0 ? 100 : Math.round((assessed.reduce((sum, item) => {
    return sum + CONFIDENCE_COVERAGE[item.confidence];
  }, 0) / applicable.length) * 100);
  const availableDimensions = dimensions.filter((dimension) => dimension.score !== null);
  const totalDimensionWeight = availableDimensions.reduce((sum, dimension) => {
    return sum + (DIMENSIONS.find((item) => item.id === dimension.id)?.weight ?? 0);
  }, 0);
  const score = totalDimensionWeight === 0 ? null : Math.round(availableDimensions.reduce((sum, dimension) => {
    const weight = DIMENSIONS.find((item) => item.id === dimension.id)?.weight ?? 0;
    return sum + (dimension.score ?? 0) * weight;
  }, 0) / totalDimensionWeight);

  return {
    schemaVersion: "1.0",
    tool: { name: "ddd-lens", version },
    generatedAt: now.toISOString(),
    projectName: config.project?.name ?? stats.root.split(/[\\/]/).pop() ?? "project",
    fit: evaluateFit(config.fit),
    adoption: {
      score,
      label: adoptionLabel(score, evidenceCoverage),
      evidenceCoverage,
      dimensions
    },
    criteria,
    findings: detectors.flatMap((detector) => detector.findings),
    limitations: [
      "静的解析は設計意図、チーム間の言語、実際の意思決定プロセスを完全には観測できません。",
      "自動検出の一致は良いDDDを証明せず、不一致もDDD不在を証明しません。",
      "スコアは組織間の順位付けではなく、同一プロジェクトの対話と経時変化のために使用してください。",
      "重要な判断はリポジトリ、ワークショップ、インタビュー、運用指標を組み合わせて確認してください。"
    ],
    stats
  };
}
