# ADR-0001 Monolito Modular como Arquitetura Inicial

- Status: Accepted
- Data: 2026-04-18

## Contexto

O produto inicia como MVP de entregas e evoluira para entregas + caronas. A plataforma concentra regras sensiveis (auth, aprovacao, financeiro, saques, auditoria).

## Decisao

Adotar monolito modular com Clean Architecture por modulo e contratos explicitos por portas.

## Consequencias

### Positivas

- Operacao simples no inicio.
- Governanca de seguranca centralizada.
- Menor custo de coordenacao entre times.
- Fronteiras prontas para extracao futura.

### Negativas

- Escalabilidade independente por modulo adiada.
- Risco de acoplamento se regras de fronteira nao forem fiscalizadas.

## Guardrails

- Dependencias sempre apontam para dentro.
- Nao colocar regra critica no admin Next.js.
- Toda mudanca relevante gera atualizacao de docs e contratos.
