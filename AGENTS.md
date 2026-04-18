# AGENTS - Memory First Protocol

This repository uses a strict "memory first" workflow.

## Primary Goal

Preserve architectural integrity before writing code.

## Mandatory Order For Any Task

1. Read project context/governance files first.
2. Identify active architecture, contracts, business rules, and module constraints.
3. Propose a short change plan.
4. Implement only after confirming alignment with architecture, contracts, docs, and tests.

## Priority Files To Read Before Any Change

- `README.md`
- `AGENTS.md`
- `docs/architecture/system-context.md`
- `docs/architecture/module-boundaries.md`
- `docs/architecture/dependency-rules.md`
- `docs/business-rules/*`
- `docs/contracts/openapi/openapi.yaml`
- `docs/contracts/api/*`
- `docs/modules/*`
- `docs/adr/*`
- files in the directly affected module

## Non-Negotiable Rules

- Do not invent architecture outside repository standards.
- Do not implement without reading applicable contracts and rules.
- Do not change contracts without updating OpenAPI and derived artifacts.
- Do not change business rules without updating corresponding docs.
- Do not spread critical logic outside proper layer.
- Do not move critical rules to frontend/admin when they belong in the API.
- Do not use `shared/` as a generic dumping ground.
- Do not make large changes without explaining impact on modules, contracts, and tests.

## Required Response Order

1. Context read
2. Constraints found
3. Change plan
4. Files to modify
5. Impact on contracts/docs/tests

## Conflict/Missing Context Handling

- If context is missing, stop and explicitly list missing files/decisions.
- If code and docs conflict, report conflict before implementing.
- For critical areas (security, audit, finance, approvals, workers, public contracts), treat documentation and tests as mandatory gates.
