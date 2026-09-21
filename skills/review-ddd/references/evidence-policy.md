# Evidence and confidence policy

## Evidence strength

Prefer evidence in this order, while checking recency:

1. Executed constraints and production behavior: architecture tests, contract tests, observed change/incident data.
2. Current code plus tests demonstrating an invariant or translation boundary.
3. Current, owned architecture/model documents linked to implementation.
4. Workshop records or interviews with responsible domain and engineering participants.
5. Naming conventions, directory names, annotations, or keyword matches.

## Confidence

- `high`: two independent strong sources agree, or an executable constraint directly proves the claim.
- `medium`: one strong source, or multiple consistent current documents/interviews.
- `low`: naming, layout, regex/static heuristics, a single unsupported claim, or stale evidence.

When documents and implementation disagree, report the contradiction. Prefer current runtime/test behavior for what the system does; use interviews and documents for intended behavior.

Never infer correctness from folder names, DDD type names, microservices, CQRS, or event sourcing. Framework annotations are coupling signals, not automatic failures. A modular monolith can implement bounded contexts well.
