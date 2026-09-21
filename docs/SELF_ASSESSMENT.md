# DDD Lens 評価レポート: ddd-lens

> 生成日時: 2026-09-21T07:47:45.353Z  
> 自動検出は設計レビューの代替ではありません。確信度と根拠カバレッジを必ず併読してください。

## 結論

- DDD適用妥当性: **判定保留**
- DDD適用度: **50/100 — 一貫した運用へ移行中**
- 根拠カバレッジ: **67%**

DDDの必要性を判断する情報が不足しています。適用度とは別に、事業複雑性と差別化価値を確認してください。

## 評価軸

| 評価軸 | スコア / 100 | 根拠カバレッジ |
| --- | ---: | ---: |
| 戦略設計 | 50 | 75% |
| ユビキタス言語と協働 | 50 | 33% |
| ドメインモデル | 50 | 67% |
| 境界と依存関係 | 50 | 67% |
| 検証と進化 | 50 | 100% |

## 重要な指摘

重大な自動検出事項はありません。ただし未評価項目を問題なしとは扱わないでください。

## 評価項目

| ID | 項目 | スコア | 確信度 | 根拠 |
| --- | --- | ---: | --- | --- |
| `strategy.subdomains` | サブドメインの分類 | 未評価 | low | none |
| `strategy.bounded-contexts` | 境界づけられたコンテキスト | 2/4 | low | automatic |
| `strategy.context-map` | コンテキストマップ | 2/4 | low | automatic |
| `strategy.ownership` | チーム所有権 | 2/4 | low | automatic |
| `language.glossary` | 用語の明示 | 2/4 | low | automatic |
| `language.code-alignment` | 会話・文書・コードの一致 | 未評価 | low | none |
| `language.collaboration` | 継続的モデリング | 未評価 | low | none |
| `model.behavior` | 振る舞いと不変条件 | 未評価 | low | none |
| `model.aggregates` | 集約境界 | 2/4 | low | automatic |
| `model.pattern-fit` | 戦術パターンの適合性 | 2/4 | low | automatic |
| `boundaries.domain-isolation` | ドメインの技術非依存性 | 未評価 | low | none |
| `boundaries.enforcement` | 境界の自動検証 | 2/4 | low | automatic |
| `boundaries.integration` | 外部・他コンテキストとの変換 | 2/4 | low | automatic |
| `evolution.domain-tests` | ドメイン例によるテスト | 2/4 | low | automatic |
| `evolution.decisions` | 設計判断の履歴 | 2/4 | low | automatic |

## 限界

- 静的解析は設計意図、チーム間の言語、実際の意思決定プロセスを完全には観測できません。
- 自動検出の一致は良いDDDを証明せず、不一致もDDD不在を証明しません。
- スコアは組織間の順位付けではなく、同一プロジェクトの対話と経時変化のために使用してください。
- 重要な判断はリポジトリ、ワークショップ、インタビュー、運用指標を組み合わせて確認してください。

## 走査情報

- 対象: `/workspace/scratch/833cc098d8a5/ddd-lens`
- 走査ファイル: 32（ソース 12、文書 11）
- 大容量のため除外: 0
- ファイル数上限到達: いいえ
