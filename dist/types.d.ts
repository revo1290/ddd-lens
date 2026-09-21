export type Locale = "ja" | "en";
export type Confidence = "high" | "medium" | "low";
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type EvidenceKind = "code" | "document" | "test" | "config" | "interview" | "workshop" | "metric";
export type DimensionId = "strategy" | "language" | "model" | "boundaries" | "evolution";
export interface Evidence {
    kind: EvidenceKind;
    path?: string;
    line?: number;
    note: string;
}
export interface ManualAssessment {
    score: number | null;
    confidence?: Confidence;
    notApplicable?: boolean;
    rationale?: string;
    evidence?: Evidence[];
}
export interface FitAnswers {
    businessRuleComplexity?: number | null;
    differentiation?: number | null;
    changeFrequency?: number | null;
    integrationComplexity?: number | null;
    domainExpertAccess?: number | null;
}
export interface LensConfig {
    version: 1;
    project?: {
        name?: string;
        description?: string;
    };
    locale?: Locale;
    fit?: FitAnswers;
    assessment?: Record<string, ManualAssessment>;
    scan?: {
        include?: string[];
        exclude?: string[];
        maxFiles?: number;
        maxFileBytes?: number;
    };
}
export interface CriterionDefinition {
    id: string;
    dimension: DimensionId;
    title: string;
    question: string;
    weight: number;
    why: string;
}
export interface CriterionResult {
    id: string;
    dimension: DimensionId;
    title: string;
    score: number | null;
    confidence: Confidence;
    source: "automatic" | "manual" | "combined" | "none";
    notApplicable: boolean;
    evidence: Evidence[];
    rationale: string;
}
export interface Finding {
    ruleId: string;
    severity: Severity;
    confidence: Confidence;
    title: string;
    message: string;
    advice: string;
    evidence: Evidence[];
}
export interface DimensionScore {
    id: DimensionId;
    title: string;
    score: number | null;
    coverage: number;
}
export interface FitResult {
    recommendation: "recommended" | "selective" | "not-recommended" | "insufficient-evidence";
    score: number | null;
    readinessWarning: boolean;
    rationale: string;
}
export interface ScanStats {
    root: string;
    filesScanned: number;
    sourceFiles: number;
    documentFiles: number;
    skippedLargeFiles: number;
    truncatedByLimit: boolean;
    durationMs: number;
}
export interface AssessmentReport {
    schemaVersion: "1.0";
    tool: {
        name: "ddd-lens";
        version: string;
    };
    generatedAt: string;
    projectName: string;
    fit: FitResult;
    adoption: {
        score: number | null;
        label: string;
        evidenceCoverage: number;
        dimensions: DimensionScore[];
    };
    criteria: CriterionResult[];
    findings: Finding[];
    limitations: string[];
    stats: ScanStats;
}
export interface ScannedFile {
    relativePath: string;
    absolutePath: string;
    category: "source" | "document" | "config" | "test";
    content: string;
}
export interface ScanContext {
    root: string;
    files: ScannedFile[];
    stats: ScanStats;
}
export interface DetectorOutput {
    criterionId: string;
    score: number | null;
    confidence: Confidence;
    rationale: string;
    evidence: Evidence[];
    findings: Finding[];
}
//# sourceMappingURL=types.d.ts.map