# System Overview - tahnamao-core

## O que o sistema faz

`tahnamao-core` e a API soberana do ecossistema Tahnamao. O sistema concentra regras criticas de autenticacao, onboarding e aprovacao manual de motoristas, cadastro/autenticacao de clientes, gestao de enderecos, prontidao operacional e contratos de integracao para clientes internos.

## Objetivos principais

- Proteger regras de negocio e seguranca no backend.
- Expor APIs consistentes e versionadas em `/api/v1`.
- Garantir contratos explicitos via OpenAPI e docs de contrato.
- Permitir evolucao modular com Clean Architecture.

## Dominios e capacidades

### Identity

- Login de motorista por CPF + senha.
- Login de cliente por email + senha.
- Rotacao e revogacao de refresh token com hash persistido.
- Validacao de acesso baseada no status da conta (`DRIVER`, `ADMIN` e `CUSTOMER`).

### Drivers

- Criacao de cadastro em rascunho.
- Atualizacao de perfil e definicao de senha.
- Envio e reenvio de documentos versionados.
- Submissao de onboarding para revisao manual.
- Consulta de status de onboarding.

### Customers

- Registro de cliente com `name`, `email`, `phone` e `password`.
- Autenticacao de cliente com emissao de `accessToken` e `refreshToken`.
- Consulta e atualizacao do perfil do cliente autenticado.
- CRUD de enderecos do cliente com soft delete.
- Definicao de endereco padrao com garantia de unicidade por cliente.
- Sugestao de logradouro/bairro/cidade/estado por CEP via integracao ViaCEP.

### Admin Drivers

- Login administrativo dedicado em endpoint separado (`/admin/auth/login`).
- Fila de motoristas pendentes para revisao.
- Snapshot detalhado de cadastro e documentos.
- Acoes de aprovar, rejeitar, bloquear e desbloquear motorista.
- Acoes de aprovar e rejeitar documento.

### Files

- Registro de metadados de arquivos usados no onboarding.

### Health

- Sonda de liveness do processo.
- Sonda de readiness de dependencia critica (MongoDB).

## Fluxo funcional resumido

1. Cliente se cadastra e autentica para iniciar o fluxo de pedidos.
2. Cliente gerencia seus enderecos salvos, incluindo definicao de endereco padrao.
3. Motorista cria draft de cadastro.
4. Motorista completa perfil, senha e documentos.
5. Motorista envia onboarding para revisao manual.
6. Admin revisa e decide (aprova/rejeita/bloqueia).
7. Motorista aprovado recebe acesso operacional conforme regras de status.

## Contratos e documentacao oficial

- OpenAPI fonte de verdade: `docs/contracts/openapi/openapi.yaml`
- Contratos por dominio: `docs/contracts/api`
- Regras de negocio: `docs/business-rules`
- Fronteiras e arquitetura: `docs/architecture`
- Decisoes arquiteturais: `docs/adr`

## Regra de manutencao obrigatoria

Sempre que uma API for criada, removida ou alterada:

1. Atualizar `docs/contracts/openapi/openapi.yaml`.
2. Atualizar o arquivo de contrato em `docs/contracts/api`.
3. Atualizar docs de modulo e regra de negocio se houver impacto funcional.
4. Atualizar testes relevantes (unitarios, contrato, integracao/e2e conforme escopo).
