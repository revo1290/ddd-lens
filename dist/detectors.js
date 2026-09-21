function locate(context, specs, max = 5) {
    const evidence = [];
    for (const file of context.files) {
        for (const spec of specs) {
            if (spec.categories && !spec.categories.includes(file.category))
                continue;
            if (spec.pathPattern && !spec.pathPattern.test(file.relativePath))
                continue;
            const lines = file.content.split(/\r?\n/);
            for (let index = 0; index < lines.length; index += 1) {
                const line = lines[index] ?? "";
                spec.pattern.lastIndex = 0;
                if (!spec.pattern.test(line))
                    continue;
                evidence.push({
                    kind: file.category === "test" ? "test" : file.category === "source" ? "code" : "document",
                    path: file.relativePath,
                    line: index + 1,
                    note: line.trim().slice(0, 180)
                });
                if (evidence.length >= max)
                    return evidence;
            }
        }
    }
    return evidence;
}
function output(criterionId, score, confidence, rationale, evidence, findings = []) {
    return { criterionId, score, confidence, rationale, evidence, findings };
}
function positiveSignal(context, criterionId, specs, foundMessage, missingMessage) {
    const evidence = locate(context, specs);
    return evidence.length > 0
        ? output(criterionId, 2, "low", `${foundMessage}。ただし存在だけでは運用品質を証明できません`, evidence)
        : output(criterionId, null, "low", missingMessage, []);
}
function docs(...patterns) {
    return patterns.map((pattern) => ({ pattern, categories: ["document", "config"] }));
}
export function runDetectors(context) {
    const results = [];
    results.push(positiveSignal(context, "strategy.subdomains", docs(/\bcore subdomain\b|コア[・ ]?サブドメイン/i, /supporting subdomain|支援[・ ]?サブドメイン/i, /generic subdomain|汎用[・ ]?サブドメイン/i), "サブドメイン分類を示す記述を検出しました", "サブドメインの事業上の分類はコードから判断できません"));
    results.push(positiveSignal(context, "strategy.bounded-contexts", [
        ...docs(/bounded context|境界づけられたコンテキスト|境界付けられたコンテキスト/i),
        { pattern: /BoundedContext|boundedContext/, categories: ["source", "config"] },
        { pattern: /BoundedContext/, pathPattern: /\.cml$/i }
    ], "境界づけられたコンテキストの明示を検出しました", "モデル境界の明示を検出できませんでした"));
    results.push(positiveSignal(context, "strategy.context-map", [
        ...docs(/context map|コンテキスト[・ ]?マップ|upstream|downstream|上流|下流/i),
        { pattern: /ContextMap|CustomerSupplier|AnticorruptionLayer/, pathPattern: /\.cml$/i }
    ], "コンテキスト間関係を示す資料を検出しました", "コンテキスト間の関係と統合方針は自動確認できませんでした"));
    results.push(positiveSignal(context, "strategy.ownership", [
        { pattern: /./, pathPattern: /(?:^|\/)CODEOWNERS$/ },
        ...docs(/team owner|ownership|担当チーム|オーナー|意思決定者/i)
    ], "所有権を示す記述を検出しました", "コンテキストとチーム所有権の対応は自動確認できませんでした"));
    results.push(positiveSignal(context, "language.glossary", [
        { pattern: /./, pathPattern: /(?:glossary|ubiquitous[-_ ]?language|用語集|ドメイン用語)/i },
        ...docs(/ubiquitous language|ユビキタス言語|用語集/i)
    ], "用語集またはユビキタス言語の記述を検出しました", "共有されるドメイン用語の根拠を検出できませんでした"));
    results.push(output("language.code-alignment", null, "low", "業務会話・文書・コードの意味的一致は静的な語句検索だけでは評価できません", []));
    results.push(positiveSignal(context, "language.collaboration", docs(/event storming|eventstorming|modeling workshop|モデリング会|ドメインエキスパート|業務有識者/i), "協働モデリングの記録を検出しました", "継続的な協働モデリングはリポジトリだけでは判断できません"));
    const domainFiles = context.files.filter((file) => file.category === "source" && /(?:^|\/)(?:domain|model)(?:\/|$)/i.test(file.relativePath));
    const domainBehaviorEvidence = locate({ ...context, files: domainFiles }, [
        { pattern: /\b(?:validate|ensure|assert|can[A-Z]|is[A-Z]|change|cancel|approve|reject|activate|deactivate|reserve|release)\w*\s*\(/ },
        { pattern: /不変条件|業務ルール|DomainException|BusinessRule/i }
    ], 6);
    const anemicEvidence = locate({ ...context, files: domainFiles }, [{ pattern: /\b(?:get|set)[A-Z]\w*\s*\(/ }], 8);
    if (domainFiles.length === 0) {
        results.push(output("model.behavior", null, "low", "ドメインモデルの配置を特定できませんでした", []));
    }
    else if (domainBehaviorEvidence.length === 0 && anemicEvidence.length >= 4) {
        const finding = {
            ruleId: "DDD-MODEL-001",
            severity: "high",
            confidence: "low",
            title: "貧血ドメインモデルの疑い",
            message: "domain/model配下でアクセサは見つかりましたが、業務上の振る舞いを示すシグナルが見つかりませんでした。",
            advice: "アプリケーションサービスに散在する条件分岐を確認し、不変条件を最小の集約またはValue Objectへ移せるか検討してください。",
            evidence: anemicEvidence
        };
        results.push(output("model.behavior", 1, "low", "構造だけのモデルである可能性があります。人による確認が必要です", anemicEvidence, [finding]));
    }
    else {
        results.push(output("model.behavior", 2, "low", "ドメイン固有の振る舞いらしきシグナルを検出しました", domainBehaviorEvidence));
    }
    results.push(positiveSignal(context, "model.aggregates", [
        { pattern: /AggregateRoot|@AggregateRoot|aggregate root|集約ルート/i, categories: ["source", "test", "document"] },
        { pattern: /\bAssociation\s*</, categories: ["source"] }
    ], "集約ルートの明示を検出しました", "集約の整合性境界は命名だけでは判断できません"));
    const tacticalEvidence = locate(context, [
        { pattern: /@(?:Entity|ValueObject|AggregateRoot|DomainService|Repository)\b|\b(?:ValueObject|AggregateRoot|DomainEvent)\b/, categories: ["source", "test"] }
    ]);
    results.push(tacticalEvidence.length > 0
        ? output("model.pattern-fit", 2, "low", "戦術パターンの明示を検出しました。パターン数は高評価の根拠になりません", tacticalEvidence)
        : output("model.pattern-fit", null, "low", "戦術パターンは命名や注釈がなくても成立するため未評価です", []));
    const frameworkEvidence = locate({ ...context, files: domainFiles }, [{ pattern: /^\s*import\s+(?:org\.springframework|jakarta\.(?:persistence|ws|servlet)|javax\.(?:persistence|ws|servlet)|com\.fasterxml|express|next\/|@nestjs|sqlalchemy|django)/i }], 8);
    if (domainFiles.length === 0) {
        results.push(output("boundaries.domain-isolation", null, "low", "ドメイン領域を特定できないため未評価です", []));
    }
    else if (frameworkEvidence.length >= 3) {
        const finding = {
            ruleId: "DDD-BOUNDARY-001",
            severity: "medium",
            confidence: "medium",
            title: "ドメイン層への技術依存",
            message: "domain/model配下からWeb、ORM、DI、シリアライズ等の技術依存を複数検出しました。",
            advice: "注釈利用を即座に禁止せず、業務ルールのテスト容易性と技術変更の影響を確認してください。外部型は境界で変換します。",
            evidence: frameworkEvidence
        };
        results.push(output("boundaries.domain-isolation", 1, "medium", "技術依存がドメイン境界へ漏れている可能性があります", frameworkEvidence, [finding]));
    }
    else {
        results.push(output("boundaries.domain-isolation", 2, "low", "明白な技術依存は限定的でした。依存グラフによる追加確認が必要です", frameworkEvidence));
    }
    results.push(positiveSignal(context, "boundaries.enforcement", [
        { pattern: /ArchUnit|SpringModulith|ApplicationModules\.of|NetArchTest|dependency-cruiser|dependencyCheck|import-linter|go-arch-lint/i, categories: ["source", "test", "config"] },
        { pattern: /noCycles|beFreeOfCycles|onionArchitecture|layeredArchitecture|slices\(\)/i, categories: ["test"] }
    ], "アーキテクチャ制約の自動検証を検出しました", "境界をCIで検証する仕組みを検出できませんでした"));
    results.push(positiveSignal(context, "boundaries.integration", [
        { pattern: /anti[- ]?corruption|anticorruption|ACL|published language|open host service|腐敗防止層|変換アダプタ/i, categories: ["document", "source", "test"] },
        { pattern: /(?:^|\/)(?:adapter|adapters|translator|mapping)(?:\/|$)/i, categories: ["source"] }
    ], "外部モデルとの変換境界を示すシグナルを検出しました", "外部・他コンテキストとのモデル変換は自動確認できませんでした"));
    const domainTestEvidence = locate(context, [
        { pattern: /Aggregate|ValueObject|Domain|BusinessRule|Invariant|業務ルール|不変条件/i, categories: ["test"] },
        { pattern: /should|when|given|then/i, categories: ["test"], pathPattern: /(?:domain|model)/i }
    ], 6);
    results.push(domainTestEvidence.length > 0
        ? output("evolution.domain-tests", 2, "low", "ドメイン語彙を含むテストを検出しました", domainTestEvidence)
        : output("evolution.domain-tests", null, "low", "業務ルールを実行可能な例として保全しているか確認できませんでした", []));
    results.push(positiveSignal(context, "evolution.decisions", [
        { pattern: /Status|Decision|Consequences|Context|決定|背景|見直し条件/i, pathPattern: /(?:^|\/)(?:docs\/)?(?:adr|decision|decisions)(?:\/|$)/i },
        { pattern: /architecture decision record|ADR/i, categories: ["document"] }
    ], "設計判断の記録を検出しました", "境界・モデルに関する設計判断の履歴を検出できませんでした"));
    return results;
}
//# sourceMappingURL=detectors.js.map