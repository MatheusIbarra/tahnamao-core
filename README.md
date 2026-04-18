# tahnamao-core

Backend core soberano para o ecossistema Tahnamao.

## Stack

- NestJS + TypeScript
- MongoDB
- OpenAPI/Swagger como contrato principal
- Clean Architecture em monolito modular

## Princípios

- Regras críticas residem no backend (`auth`, auditoria, aprovação, financeiro, saques).
- `NestJS` é camada de entrega; domínio e aplicação não dependem de framework.
- Contratos explícitos entre módulos e integrações.
- Documentação viva versionada no repositório.

## Endpoints iniciais

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

## Documentação

- Visao geral do sistema: `docs/system-overview.md`
- Arquitetura: `docs/architecture`
- Regras de negócio: `docs/business-rules`
- ADRs: `docs/adr`
- Contratos API: `docs/contracts`
- Runbooks: `docs/runbooks`
