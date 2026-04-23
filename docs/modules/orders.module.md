# Module Spec - orders

## Responsabilidade

Gerenciar o dominio de marketplace para o app food: catalogo de restaurantes, cardapio, ciclo de pedidos, avaliacoes e eventos em tempo real.

## Entradas

- consultas publicas de restaurantes e cardapio
- operacoes de restaurante em `/api/v1/business/restaurants/*`
- operacoes de cliente em `/api/v1/orders/*`

## Saidas

- pedidos em `orders` com `publicCode` e historico de status
- respostas de catalogo e cardapio para o `tahnamao-food`
- respostas de avaliacoes e agregados por restaurante
- evento websocket `order:new` para sala do restaurante

## Portas

- `RestaurantDocument` para perfil, status operacional e agregados de reviews
- `MenuItemDocument` para disponibilidade e composicao de cardapio
- `OrderDocument` para ciclo de vida do pedido e feedback do cliente
- `OrdersGateway` para emissao de eventos em tempo real
