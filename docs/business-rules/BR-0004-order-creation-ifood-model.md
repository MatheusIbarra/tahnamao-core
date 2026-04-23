# BR-0004 Order Creation (iFood Model)

## Contexto

Define as regras para criacao de pedidos por clientes autenticados no fluxo de marketplace de restaurantes.

## Regras

1. Pedido so pode ser criado por cliente autenticado.
2. Restaurante informado em `restaurantId` deve existir.
3. Restaurante deve estar com status `ABERTO` para aceitar pedido.
4. Todos os `menuItemId` enviados devem pertencer ao restaurante informado.
5. Todos os itens do pedido devem estar `available=true`.
6. `subtotal` da linha deve ser calculado por `price * quantity`.
7. `subtotal` do pedido deve ser a soma dos subtotais das linhas.
8. `totalAmount` do pedido deve considerar `subtotal + deliveryFee`.
9. Pedido nasce com status inicial `PENDING`.
10. `statusHistory` deve registrar a entrada inicial em `PENDING`.
11. Ao criar pedido, backend deve emitir evento websocket `order:new` para o restaurante.

## Invariantes

- Pedido invalido por restaurante fechado ou item indisponivel deve retornar `422` com mensagem clara.
- Campo `assignedDeliverer` inicia como `null` no momento da criacao.
- A colecao de persistencia de pedidos e `orders`.

## Impacto de contrato

- Mudancas nessas regras exigem atualizacao de OpenAPI e contratos em `docs/contracts/api`.
