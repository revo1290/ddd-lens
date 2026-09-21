# ddd-lens

**DDDを使っている気分ではなく、事業上の複雑さに効いているかを診断する。**

`ddd-lens` は、日本の開発チーム向けのDomain-Driven Design（DDD）評価OSSです。リポジトリの静的解析、チームが追加する根拠、AIレビュー用のオープンスキルを組み合わせ、次を分けて報告します。

- そもそもDDDを適用する価値があるか
- 戦略設計・言語・モデル・境界・進化のどこまで根拠があるか
- 確認できた事実、弱いシグナル、未確認事項
- 「DDDごっこ」と過剰設計の疑い
- 次に直す価値が高いこと

> [!IMPORTANT]
> フォルダ名やアノテーションだけでDDDの良否は判断できません。本ツールは自動検出を低確信度のシグナルとして扱い、未確認を0点にも合格にも変換しません。

## なぜ別のツールが必要か

既存ツールはそれぞれ有用ですが、主に知識の自己評価、用語整合、特定言語の依存ルール、コンテキストモデリングを個別に扱います。`ddd-lens` はそれらを置き換えず、**適用妥当性から改善判断までの評価面**を埋めます。

| 観点 | ddd-lens | 一般的な静的解析 | DDDモデリングツール | 知識アンケート |
| --- | --- | --- | --- | --- |
| DDD適用の費用対効果 | 対応 | 非対応 | 一部 | 非対応 |
| コード・文書の自動シグナル | 対応 | 対応 | 一部 | 非対応 |
| 戦略・戦術・運用を横断 | 対応 | 非対応 | 戦略中心 | 知識中心 |
| 未確認と不合格を分離 | 対応 | 製品依存 | 製品依存 | 製品依存 |
| AIとの対話レビュー | 同梱スキル | 非対応 | 非対応 | 非対応 |

## クイックスタート

Node.js 20以上が必要です。npm公開前はGitHubからインストールできます。

```bash
cd your-project
npm install --save-dev github:revo1290/ddd-lens
npx ddd-lens scan .
```

Markdown、JSON、SARIFも出力できます。

```bash
npx ddd-lens scan . --format markdown --output ddd-lens-report.md
npx ddd-lens scan . --format json --output ddd-lens-report.json
npx ddd-lens scan . --format sarif --output ddd-lens.sarif
```

人が持つ根拠を補完すると、診断精度が上がります。

```bash
npx ddd-lens init
```

生成された `.ddd-lens.yml` に、DDDの適用妥当性と確認済み根拠を記入して再実行します。

## 評価モデル

DDD適用の必要性と、現在の適用品質を混ぜません。

| 評価 | 内容 | 重み |
| --- | --- | ---: |
| 戦略設計 | サブドメイン、境界づけられたコンテキスト、コンテキストマップ、所有権 | 30% |
| ユビキタス言語と協働 | 用語、文書・コードとの一致、継続的モデリング | 20% |
| ドメインモデル | 振る舞い、不変条件、集約、戦術パターンの適合性 | 20% |
| 境界と依存関係 | 技術非依存性、自動検証、外部モデルの変換 | 20% |
| 検証と進化 | ドメインテスト、設計判断の履歴 | 10% |

各項目は0〜4ですが、判断材料がなければ `未評価` です。総合値には確信度で加重した**根拠カバレッジ**を併記し、40%未満では適用段階を判定しません。詳細は [評価方法](docs/METHODOLOGY.md) を参照してください。

## 正直な判定の例

- 複雑な業務判断が少ない → DDDを増やさず、CRUDと明確なモジュール分割を推奨
- `domain/` はあるが振る舞いがサービス層へ集中 → 「DDD適用済み」ではなく貧血モデルの疑い
- マイクロサービス化済みだが語彙とモデルが全サービス共通 → bounded contextの証拠にはしない
- CQRS/Event Sourcingを利用 → それ自体では加点しない。解決した問題と運用コストを評価
- ORMアノテーションがドメインに存在 → 即失格にせず、変更影響とテスト容易性を確認

## GitHub Actions

```yaml
name: DDD Lens
on: [pull_request]

jobs:
  assess:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: revo1290/ddd-lens@main
        with:
          path: .
          format: sarif
          output: ddd-lens.sarif
          fail-on: high
```

`fail-on` は `critical | high | medium | low | never`。初回は `never` でベースラインを確認してください。

## AIレビュー用オープンスキル

[`skills/review-ddd`](skills/review-ddd/SKILL.md) は、Codex/ChatGPTなどのスキル対応エージェント向けです。CLIでは観測できないチーム運用を、最大5問ずつのインタビューで補い、同じ評価軸で率直なレビューを作成します。

## 対応範囲

初期版はJava/Kotlin、TypeScript/JavaScript、C#、Go、Pythonなどの一般的な構成を言語横断の保守的ヒューリスティックで検査します。ArchUnit、Spring Modulith、jMolecules、NetArchTest、dependency-cruiser等の明示的シグナルを認識します。

構文木や依存グラフによる厳密な言語別解析は今後の拡張です。[既知の限界](docs/LIMITATIONS.md) を必ず確認してください。

## 設計原則

1. DDDを採用しない結論を有効な成果とする
2. 戦略設計を戦術パターン数より重く扱う
3. 事実・推定・未確認・提案を混ぜない
4. 自動検出の確信度を誇張しない
5. 他チームとのランキングではなく、同じプロジェクトの学習に使う
6. オフラインで動作し、解析対象コードを外部送信しない

## 開発

```bash
npm ci
npm run ci
node dist/cli.js scan . --format markdown
```

ルール提案は「どのDDD概念を、どの観測可能な証拠で、どの誤検知リスクを許容して検出するか」をIssueに記載してください。[コントリビューションガイド](CONTRIBUTING.md) も参照してください。

## 根拠資料

評価軸はEric EvansのDDD Reference、bounded contextの解説、Context Mapper、Microsoftのドメイン分析ガイドなどの一次・公式資料を基礎にしています。参照先と、どの判断に利用したかは [SOURCES.md](docs/SOURCES.md) に明記しています。

## ライセンス

Apache License 2.0。`ddd-lens` はEric Evans、Domain Language, Inc.、DDD Crew、Microsoft、各ツールの公式プロジェクトとは独立したコミュニティOSSです。
