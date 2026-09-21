---
name: review-ddd
description: Evidence-based Domain-Driven Design assessment for repositories, architecture documents, and team practices. Use when asked to evaluate DDD adoption, DDD fit, bounded contexts, ubiquitous language, tactical patterns, modular monoliths, architecture boundaries, “DDD maturity,” anemic domain models, or improvement priorities. Produces candid Japanese-first reviews while separating observed facts, inferences, unknowns, and recommendations.
---

# Review DDD

Evaluate whether DDD is worth its cost, how coherently it is applied, and what to improve next. Treat the review as a decision aid, not a certification.

## Required workflow

1. Establish scope.
   - Identify the product, repository roots, services/modules, team boundaries, and requested depth.
   - Do not equate a deployable unit, directory, or team with a bounded context without evidence.
2. Assess DDD fit before adoption quality.
   - Examine business-rule complexity, competitive differentiation, change frequency, integration complexity, and access to domain experts.
   - Recommend selective or no DDD when its ceremony would exceed its benefit.
3. Gather evidence.
   - Inspect architecture and domain documents, code, tests, dependency rules, ownership, and ADRs.
   - Run `npx ddd-lens scan <root> --format json` when the CLI is available; treat its outputs as signals, never verdicts.
   - Read [references/evidence-policy.md](references/evidence-policy.md) before assigning confidence.
4. Resolve material unknowns.
   - Ask no more than five questions at once.
   - Prioritize business invariants, terminology conflicts, context ownership, integration contracts, and recurring change pain.
   - Keep unanswered criteria as `unknown`; never silently score them zero or pass them.
5. Score using [references/rubric.md](references/rubric.md).
   - Assess strategy, language/collaboration, domain model, boundaries, and evolution separately.
   - Record score, confidence, evidence, and rationale for every assessed item.
   - Report evidence coverage beside every aggregate score.
6. Challenge the design candidly.
   - Call out DDD theater: technical layers renamed as domains, marker interfaces without invariants, pattern counting, CRUD wrapped in aggregates, or context boundaries copied from the org chart.
   - Call out overengineering: DDD applied to stable generic CRUD, needless repositories, events, CQRS, event sourcing, or microservices.
   - Do not prescribe a pattern merely because it is associated with DDD.
7. Prioritize improvements.
   - Propose at most five actions, ordered by business risk reduced and learning gained.
   - Prefer reversible experiments and enforcement close to the failure source.
   - Include “keep as-is” when change cost exceeds likely benefit.

## Output contract

Write in Japanese unless the user requests another language. Lead with the verdict and use this structure:

1. `結論`: fit recommendation, adoption score or `判定保留`, evidence coverage, and one blunt sentence.
2. `評価`: a table with the five dimensions, score, confidence, evidence, and primary gap.
3. `重大な指摘`: only findings that materially affect correctness, changeability, or coordination.
4. `改善優先順位`: 1–5 actions with expected benefit, effort, and validation method.
5. `確認できなかったこと`: unknowns that could change the verdict.

Always distinguish:

- `事実`: directly observed in an artifact or supplied by a responsible participant.
- `推定`: supported by indirect evidence; state confidence.
- `未確認`: insufficient evidence.
- `提案`: a context-dependent next action, not a universal rule.

Never present a repository-only scan as a complete DDD assessment.
