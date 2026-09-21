import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { FitAnswers, LensConfig, ManualAssessment } from "./types.js";

const CONFIG_NAMES = [".ddd-lens.yml", ".ddd-lens.yaml"];

function assertScore(value: unknown, location: string): void {
  if (value === null || value === undefined) return;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 4) {
    throw new Error(`${location} は 0〜4 の整数、または null で指定してください`);
  }
}

function validateConfig(input: unknown): LensConfig {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("設定ファイルのルートはオブジェクトである必要があります");
  }
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1) throw new Error("version: 1 を指定してください");

  if (raw.fit && typeof raw.fit === "object") {
    for (const [key, value] of Object.entries(raw.fit as FitAnswers)) {
      assertScore(value, `fit.${key}`);
    }
  }
  if (raw.assessment && typeof raw.assessment === "object") {
    for (const [id, value] of Object.entries(raw.assessment as Record<string, ManualAssessment>)) {
      if (!value || typeof value !== "object") throw new Error(`assessment.${id} はオブジェクトで指定してください`);
      assertScore(value.score, `assessment.${id}.score`);
    }
  }
  return raw as unknown as LensConfig;
}

export async function loadConfig(root: string, explicitPath?: string): Promise<{ config: LensConfig; path?: string }> {
  const candidates = explicitPath
    ? [path.resolve(root, explicitPath)]
    : CONFIG_NAMES.map((name) => path.join(root, name));

  for (const candidate of candidates) {
    try {
      const content = await readFile(candidate, "utf8");
      return { config: validateConfig(YAML.parse(content)), path: candidate };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === "ENOENT" && !explicitPath) continue;
      if (code === "ENOENT") throw new Error(`設定ファイルが見つかりません: ${candidate}`);
      throw error;
    }
  }
  return { config: { version: 1 } };
}

export const CONFIG_TEMPLATE = `# ddd-lens 設定ファイル
# 0=不在/有害, 1=名称だけ, 2=部分適用, 3=一貫して運用, 4=計測し継続改善
version: 1
locale: ja
project:
  name: "your-project"

# DDDを採用する妥当性。適用度スコアとは分離して扱います。
fit:
  businessRuleComplexity: null
  differentiation: null
  changeFrequency: null
  integrationComplexity: null
  domainExpertAccess: null

scan:
  exclude:
    - "**/generated/**"
  maxFiles: 5000
  maxFileBytes: 524288

# 自動検出では判断できない項目を、根拠付きで補完します。
# assessment:
#   strategy.bounded-contexts:
#     score: 3
#     confidence: high
#     rationale: "各コンテキストの責任とチーム所有者を四半期ごとに見直す"
#     evidence:
#       - kind: workshop
#         path: "docs/context-map.md"
#         note: "2026-09のモデリング会で合意"
`;
