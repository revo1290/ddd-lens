#!/usr/bin/env node
import { access, writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { CRITERIA, criterionById } from "./catalog.js";
import { CONFIG_TEMPLATE, loadConfig } from "./config.js";
import { runDetectors } from "./detectors.js";
import { renderJson, renderMarkdown, renderText } from "./reporters.js";
import { renderSarif } from "./sarif.js";
import { scanRepository } from "./scanner.js";
import { buildReport } from "./score.js";

const VERSION = "0.1.0";
const program = new Command();

program
  .name("ddd-lens")
  .description("根拠と確信度を明示するDDD適用評価ツール")
  .version(VERSION);

program.command("scan")
  .description("リポジトリを走査しDDD適用状況を評価する")
  .argument("[target]", "対象ディレクトリ", ".")
  .option("-c, --config <path>", "設定ファイル")
  .option("-f, --format <format>", "text, markdown, json, sarif", "text")
  .option("-o, --output <path>", "結果の出力先。省略時は標準出力")
  .option("--fail-on <severity>", "critical, high, medium, low, never", "never")
  .action(async (target: string, options: { config?: string; format: string; output?: string; failOn: string }) => {
    const root = path.resolve(target);
    const { config } = await loadConfig(root, options.config);
    const context = await scanRepository(root, config);
    const report = buildReport(config, runDetectors(context), context.stats, VERSION);
    const renderers: Record<string, () => string> = {
      text: () => renderText(report),
      markdown: () => renderMarkdown(report),
      json: () => renderJson(report),
      sarif: () => renderSarif(report)
    };
    const renderer = renderers[options.format];
    if (!renderer) throw new Error(`未対応の形式です: ${options.format}`);
    const rendered = renderer();
    if (options.output) await writeFile(path.resolve(options.output), rendered, "utf8");
    else process.stdout.write(rendered);

    const ranks: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, never: 99 };
    const threshold = ranks[options.failOn];
    if (threshold === undefined) throw new Error(`未対応のfail-onです: ${options.failOn}`);
    if (threshold !== 99 && report.findings.some((finding) => (ranks[finding.severity] ?? 0) >= threshold)) {
      process.exitCode = 2;
    }
  });

program.command("init")
  .description("根拠補完用の設定ファイルを作成する")
  .argument("[target]", "作成先ディレクトリ", ".")
  .option("--force", "既存ファイルを上書きする", false)
  .action(async (target: string, options: { force: boolean }) => {
    const destination = path.resolve(target, ".ddd-lens.yml");
    if (!options.force) {
      try {
        await access(destination);
        throw new Error(`既に存在します: ${destination}（上書きは --force）`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    await writeFile(destination, CONFIG_TEMPLATE, "utf8");
    process.stdout.write(`${destination} を作成しました\n`);
  });

program.command("explain")
  .description("評価項目の意味と確認質問を表示する")
  .argument("[criterion]", "評価項目ID。省略時は一覧")
  .action((criterion?: string) => {
    if (!criterion) {
      process.stdout.write(`${CRITERIA.map((item) => `${item.id}\t${item.title}`).join("\n")}\n`);
      return;
    }
    const definition = criterionById(criterion);
    if (!definition) throw new Error(`未知の評価項目です: ${criterion}`);
    process.stdout.write(`${definition.id}: ${definition.title}\n質問: ${definition.question}\n理由: ${definition.why}\n`);
  });

program.parseAsync().catch((error: unknown) => {
  process.stderr.write(`ddd-lens: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
