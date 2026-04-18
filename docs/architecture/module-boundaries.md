# Module Boundaries

## Regras de fronteira

1. Modulos se comunicam por casos de uso/ports, nunca por acesso direto a repositorios de outro modulo.
2. Camada `domain` nao conhece `NestJS`, `Mongoose` ou HTTP.
3. Camada `application` orquestra e define portas.
4. Camada `infrastructure` implementa portas.
5. Camada `presentation` traduz HTTP <-> aplicacao.

## Modulos MVP

- `health`
- `identity`
- `users`
- `approvals`
- `deliveries`
- `dispatch`
- `tracking`
- `pricing`
- `drivers`
- `audit`
- `files`
- `workers`

## Modulos esqueleto

- `finance`
- `payouts`
- `notifications`
