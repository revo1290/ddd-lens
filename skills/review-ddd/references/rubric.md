# DDD Lens rubric

Use five dimensions. Do not compare different organizations by total score.

## Score meaning

| Score | Meaning |
| ---: | --- |
| 0 | Confirmed absent where required, or actively harmful |
| 1 | Naming/ceremony exists but behavior or decision rights do not support it |
| 2 | Useful local practice, inconsistent or person-dependent |
| 3 | Explicit, repeatable, and enforced across the intended scope |
| 4 | Measured or deliberately reviewed, with evidence of model evolution |
| unknown | Evidence is insufficient; exclude from numeric score and lower coverage |
| N/A | Deliberately inapplicable with a stated reason |

## Dimensions and questions

### Strategy — 30%

- Subdomains: Are core, supporting, and generic areas distinguished by business differentiation?
- Bounded contexts: Is each model/language boundary explicit, coherent, and owned?
- Context map: Are upstream/downstream relationships, contracts, and translation responsibilities explicit?
- Ownership: Can the team change its context without routine cross-team coordination?

### Ubiquitous language and collaboration — 20%

- Terms: Are meaning, aliases, examples, and context-specific polysemes accessible?
- Alignment: Does the same meaning appear in conversation, documents, code, tests, and interfaces?
- Learning loop: Do developers and domain experts regularly challenge examples, rules, and contradictions?

### Domain model — 20%

- Behavior: Do domain objects/modules protect important decisions and invariants?
- Aggregates: Do consistency and transaction needs, not object graphs, define aggregate boundaries?
- Pattern fit: Are entities, values, repositories, services, events, CQRS, or event sourcing used only where they solve an observed problem?

### Boundaries and dependencies — 20%

- Isolation: Is core business behavior protected from web, persistence, framework, and vendor models?
- Enforcement: Are forbidden dependencies, cycles, and module APIs checked automatically where practical?
- Integration: Are external and cross-context models translated at an explicit boundary?

### Validation and evolution — 10%

- Executable examples: Do tests express business rules, invariants, and edge cases in domain language?
- Decision history: Are important model/boundary decisions, assumptions, and review triggers recorded?

## Aggregation

1. Compute each dimension from assessed, applicable criteria only.
2. Confidence-weighted coverage = assessed applicable criteria weighted by `high=1.0`, `medium=0.6`, `low=0.25`, divided by all applicable criteria.
3. Do not publish a categorical adoption label below 40% coverage; write `判定保留（根拠不足）`.
4. Suggested labels when coverage is sufficient: 0–24 naming only; 25–49 partial; 50–74 becoming consistent; 75–100 consistent and evolving.
5. Keep DDD fit separate. A high-quality DDD implementation can still be an uneconomic choice.

## Fit recommendation

Rate 0–4: business-rule complexity, differentiation, change frequency, and integration complexity. Treat domain-expert access as readiness, not value.

- Average 2.75–4: `適用推奨`
- Average 1.75–2.74: `選択的適用`
- Average 0–1.74: `適用非推奨`
- Fewer than three answered factors: `判定保留`

Low domain-expert access requires a warning even when fit is high.
