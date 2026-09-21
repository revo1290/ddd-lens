export const DIMENSIONS = [
    { id: "strategy", title: "戦略設計", weight: 30 },
    { id: "language", title: "ユビキタス言語と協働", weight: 20 },
    { id: "model", title: "ドメインモデル", weight: 20 },
    { id: "boundaries", title: "境界と依存関係", weight: 20 },
    { id: "evolution", title: "検証と進化", weight: 10 }
];
export const CRITERIA = [
    {
        id: "strategy.subdomains",
        dimension: "strategy",
        title: "サブドメインの分類",
        question: "コア・支援・汎用サブドメインを、事業上の差別化に基づいて区別しているか",
        weight: 1,
        why: "DDDの投資先を決め、汎用領域への過剰設計を避けるため"
    },
    {
        id: "strategy.bounded-contexts",
        dimension: "strategy",
        title: "境界づけられたコンテキスト",
        question: "モデルと言語が有効な境界が明示され、責任範囲と所有者が説明できるか",
        weight: 1.4,
        why: "大きなモデルを一枚岩にせず、意味の衝突を局所化するため"
    },
    {
        id: "strategy.context-map",
        dimension: "strategy",
        title: "コンテキストマップ",
        question: "コンテキスト間の上流・下流関係と統合方式が明示されているか",
        weight: 1.2,
        why: "境界間の依存、交渉関係、変換責任を可視化するため"
    },
    {
        id: "strategy.ownership",
        dimension: "strategy",
        title: "チーム所有権",
        question: "コンテキストとチーム所有権が整合し、変更時の意思決定者が明確か",
        weight: 0.8,
        why: "モデル境界と組織の調整コストを管理するため"
    },
    {
        id: "language.glossary",
        dimension: "language",
        title: "用語の明示",
        question: "主要なドメイン用語、意味、別名、コンテキストが参照可能か",
        weight: 1,
        why: "同じ語の異なる意味と、異なる語の同じ意味を発見するため"
    },
    {
        id: "language.code-alignment",
        dimension: "language",
        title: "会話・文書・コードの一致",
        question: "業務用語がコードとテストに反映され、技術語への翻訳で意味が失われていないか",
        weight: 1.2,
        why: "モデルを実装と切り離された図にしないため"
    },
    {
        id: "language.collaboration",
        dimension: "language",
        title: "継続的モデリング",
        question: "ドメイン専門家と開発者が、実例と矛盾を使ってモデルを継続的に更新しているか",
        weight: 1.2,
        why: "DDDを一度きりの設計工程ではなく学習ループとして運用するため"
    },
    {
        id: "model.behavior",
        dimension: "model",
        title: "振る舞いと不変条件",
        question: "重要な業務判断と不変条件がドメインモデルに置かれているか",
        weight: 1.4,
        why: "データ構造だけの貧血モデルや巨大な手続きサービスを避けるため"
    },
    {
        id: "model.aggregates",
        dimension: "model",
        title: "集約境界",
        question: "集約が整合性とトランザクション境界として設計され、外部参照を制御しているか",
        weight: 1.2,
        why: "一貫性の範囲を明確にし、巨大集約と分散トランザクションを避けるため"
    },
    {
        id: "model.pattern-fit",
        dimension: "model",
        title: "戦術パターンの適合性",
        question: "Entity、Value Object、Repository、Domain Service等を必要な場所だけに使っているか",
        weight: 0.8,
        why: "パターン数を成果と誤認するDDDごっこを避けるため"
    },
    {
        id: "boundaries.domain-isolation",
        dimension: "boundaries",
        title: "ドメインの技術非依存性",
        question: "コアな業務判断がWeb、ORM、DI、外部SDKの都合から保護されているか",
        weight: 1.2,
        why: "技術変更と業務ルール変更を別々に進化させるため"
    },
    {
        id: "boundaries.enforcement",
        dimension: "boundaries",
        title: "境界の自動検証",
        question: "モジュール間依存、循環、禁止依存をCIで検証しているか",
        weight: 1.1,
        why: "設計意図をレビュー担当者の記憶だけに依存させないため"
    },
    {
        id: "boundaries.integration",
        dimension: "boundaries",
        title: "外部・他コンテキストとの変換",
        question: "外部モデルの漏出を防ぐ変換境界と契約があるか",
        weight: 1,
        why: "外部スキーマや上流都合で内部モデルが汚染されるのを防ぐため"
    },
    {
        id: "evolution.domain-tests",
        dimension: "evolution",
        title: "ドメイン例によるテスト",
        question: "業務ルール、不変条件、境界条件が業務語彙でテストされているか",
        weight: 1.2,
        why: "モデルの意味を実行可能な例として保全するため"
    },
    {
        id: "evolution.decisions",
        dimension: "evolution",
        title: "設計判断の履歴",
        question: "境界やモデルの重要判断、前提、見直し条件が記録されているか",
        weight: 0.8,
        why: "将来の変更で理由が失われ、古い境界が固定化するのを防ぐため"
    }
];
export function criterionById(id) {
    return CRITERIA.find((criterion) => criterion.id === id);
}
//# sourceMappingURL=catalog.js.map