# 根拠資料

2026-09-21時点。引用文の転載ではなく、評価軸の設計根拠として参照しています。

| 資料 | 種別 | 本プロジェクトでの利用 |
| --- | --- | --- |
| [Eric Evans, DDD Reference](https://www.domainlanguage.com/ddd/reference/) | 原典の公式要約、CC BY 4.0 | Bounded Context、Ubiquitous Language、Aggregates、Repositories、Context Map、Core Domain等の定義 |
| [Martin Fowler, Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) | 著者による解説 | 大規模モデルを複数の一貫したモデル境界へ分ける理由、言語と人の境界 |
| [Microsoft Azure Architecture Center, Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) | 公式アーキテクチャガイド | 事業能力中心の境界、戦略/戦術DDD、サブドメイン分類、Context Map、ACL |
| [Context Mapper Documentation](https://contextmapper.org/docs/home/) | OSS公式文書 | 戦略DDDパターン、Context Map、反復的なアーキテクチャリファクタリング |
| [DDD Crew, DDD Starter Modelling Process](https://github.com/ddd-crew/ddd-starter-modelling-process) | コミュニティOSS | モデリングを一度きりの工程ではなく継続的プロセスとして扱う観点 |
| [DDD Crew, DDD Familiarity Assessment](https://github.com/ddd-crew/ddd-familiarity-assessment) | コミュニティOSS、CC BY 4.0 | 知識評価と成熟度評価を混同しない注意。質問文はコピーしていない |
| [jMolecules](https://github.com/xmolecules/jmolecules) | OSS公式文書 | DDD building blocksとアーキテクチャ概念の明示、ArchUnit等との連携シグナル |
| [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html) | OSS公式文書 | 依存、層、循環、モジュール境界の実行可能な検証 |
| [Spring Modulith Verification](https://docs.spring.io/spring-modulith/reference/verification.html) | 公式文書 | Springアプリケーションモジュールの構造・依存・循環検証 |

## 境界

これらの資料は単一の標準化された「DDD成熟度スコア」を定義していません。`ddd-lens` の重み、閾値、カバレッジ規則は、透明で変更可能な本プロジェクト独自の評価設計です。科学的に妥当性検証済みの尺度とは主張しません。
