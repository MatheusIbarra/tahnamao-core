# BR-0005 Marketplace Canonical Alignment

## Contexto

Define o alinhamento entre `tahnamao-food` e `tahnamao-core` para centralizar regras de catálogo, cardápio, pedidos e avaliações no backend Nest.

## Regras

1. O core é a fonte única para dados de restaurantes, itens de cardápio, pedidos e avaliações.
2. O frontend `tahnamao-food` não deve consultar coleções de domínio diretamente.
3. Fluxos de negócio de restaurante (perfil, cardápio, pedidos e reviews) são servidos por endpoints `/business/restaurants/*`.
4. Fluxos de cliente (pedido e avaliação) são servidos por endpoints `/orders/*`.
5. Toda criação de pedido gera `publicCode` de rastreio e evento realtime `order:new`.
6. Avaliação só pode ser enviada para pedido `DELIVERED` ainda não avaliado.

## Invariantes

- `orders` mantém histórico de status e tracking público.
- `restaurants` mantém agregados de avaliação (`ratingSum`, `ratingCount`).
- Mudanças no contrato exigem sincronização de OpenAPI e docs em `docs/contracts/api`.
