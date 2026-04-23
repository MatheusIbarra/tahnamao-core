# Marketplace Contract (Food -> Core)

## Objetivo

Definir o contrato canônico do marketplace no `tahnamao-core` para consumo do `tahnamao-food`, removendo acesso direto ao Mongo no Next.

## Endpoints públicos

- `GET /api/v1/restaurants`
- `GET /api/v1/restaurants/{restaurantId}`
- `GET /api/v1/restaurants/{restaurantId}/reviews`
- `GET /api/v1/orders/public/{publicCode}`

## Endpoints de cliente (via `customerId`)

- `POST /api/v1/orders`
- `GET /api/v1/orders/me?customerId={customerId}`
- `GET /api/v1/orders/me/pending-reviews?customerId={customerId}`
- `POST /api/v1/orders/{orderId}/reviews?customerId={customerId}`
- `POST /api/v1/orders/{orderId}/reviews/dismiss?customerId={customerId}`

## Endpoints de negócio (via `restaurantId`)

- `GET /api/v1/business/restaurants/{restaurantId}/profile`
- `PATCH /api/v1/business/restaurants/{restaurantId}/profile`
- `PATCH /api/v1/business/restaurants/{restaurantId}/media`
- `GET /api/v1/business/restaurants/{restaurantId}/menu-items`
- `POST /api/v1/business/restaurants/{restaurantId}/menu-items`
- `PATCH /api/v1/business/restaurants/{restaurantId}/menu-items/{menuItemId}`
- `DELETE /api/v1/business/restaurants/{restaurantId}/menu-items/{menuItemId}`
- `GET /api/v1/business/restaurants/{restaurantId}/orders`
- `PATCH /api/v1/business/restaurants/{restaurantId}/orders/{orderId}/status`
- `GET /api/v1/business/restaurants/{restaurantId}/reviews`
- `GET /api/v1/business/restaurants/{restaurantId}/dashboard-summary`

## Notas de alinhamento

- Contrato canônico no core usa status de pedido em inglês (`PENDING`, `ACCEPTED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
- O `tahnamao-food` mantém mapeamento temporário para status legados da UI.
- A integração do food deve usar exclusivamente `API_URL`.
