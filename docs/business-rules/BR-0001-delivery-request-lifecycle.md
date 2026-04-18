# BR-0001 Delivery Request Lifecycle

## Contexto

Define ciclo minimo de uma solicitacao de entrega no MVP.

## Regra

1. Solicitacao nasce em `REQUESTED`.
2. Pode evoluir para `ASSIGNED` quando um entregador aceita.
3. Evolui para `PICKED_UP` apos confirmacao de coleta.
4. Evolui para `DELIVERED` em confirmacao final.
5. Pode ir para `CANCELLED` conforme politica de cancelamento.

## Invariantes

- `DELIVERED` e estado terminal.
- `CANCELLED` e estado terminal.
- Nao pode pular direto de `REQUESTED` para `DELIVERED`.

## Impacto de contrato

- Mudancas nessa regra exigem atualizacao de OpenAPI + Postman.
