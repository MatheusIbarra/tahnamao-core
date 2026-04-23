# Orders Contract

## Endpoint de criacao (cliente autenticado)

- `POST /api/v1/orders`

## Request

```json
{
  "restaurantId": "67fb2ab817f8ab6d2c75a42f",
  "items": [
    {
      "menuItemId": "67fb2b2517f8ab6d2c75a430",
      "quantity": 2,
      "observation": "Sem cebola"
    }
  ],
  "deliveryAddress": {
    "street": "Rua das Flores",
    "number": "100",
    "complement": "Apto 12",
    "neighborhood": "Centro",
    "city": "Sao Paulo",
    "state": "SP",
    "zipCode": "01001000",
    "lat": -23.55052,
    "lng": -46.633308
  },
  "paymentMethod": "PIX"
}
```

## Response `201`

```json
{
  "orderId": "67fb2c8d17f8ab6d2c75a44e",
  "status": "PENDING"
}
```

## Regras de negocio e seguranca

- Endpoint protegido por autenticação de cliente (`CustomerAuthGuard`).
- Restaurante deve existir e estar com status `ABERTO`.
- Todos os itens devem pertencer ao restaurante e estar `available=true`.
- Totais do pedido sao calculados no backend (`price * quantity` por item).
- Pedido inicia com status `PENDING`, `statusHistory` com entrada inicial e `assignedDeliverer=null`.
- Ao criar pedido, backend publica evento websocket:
  - `event`: `order:new`
  - `payload`: `{ orderId, items, deliveryAddress, totalAmount }`

## Erros relevantes

- `404`: restaurante nao encontrado.
- `422`: restaurante fechado.
- `422`: item indisponivel ou que nao pertence ao restaurante.

## Endpoint de listagem administrativa

- `GET /api/v1/admin/orders`

### Query params

- `status`: `PENDENTE | EM_ANDAMENTO | ENTREGUE | CANCELADO`
- `startDate`: data inicial no formato `YYYY-MM-DD`
- `endDate`: data final no formato `YYYY-MM-DD`
- `customer`: busca por nome ou e-mail do cliente
- `driver`: busca por nome do motorista
- `page`: pagina (default `1`)
- `limit`: tamanho da pagina (default `20`, max `100`)

### Response `200`

```json
{
  "items": [
    {
      "id": "67fb2c8d17f8ab6d2c75a44e",
      "customerName": "Maria Oliveira",
      "customerEmail": "maria@email.com",
      "driverName": "Joao Silva",
      "status": "EM_ANDAMENTO",
      "totalAmount": 84,
      "createdAt": "2026-04-23T15:32:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

## Endpoint de detalhe administrativo

- `GET /api/v1/admin/orders/{orderId}`

### Response `200`

```json
{
  "id": "67fb2c8d17f8ab6d2c75a44e",
  "publicCode": "TNM-6EF2AA11C9D0",
  "customerName": "Maria Oliveira",
  "customerEmail": "maria@email.com",
  "customerPhone": "11999999999",
  "driverName": "Joao Silva",
  "status": "ENTREGUE",
  "paymentMethod": "PIX",
  "totalAmount": 84,
  "subtotal": 84,
  "deliveryFee": 0,
  "createdAt": "2026-04-23T15:32:00.000Z",
  "updatedAt": "2026-04-23T16:10:00.000Z",
  "deliveryAddress": {},
  "items": [],
  "statusHistory": []
}
```

## Seguranca (admin)

- Endpoints administrativos exigem bearer token com claim `role=admin` via `AdminGuard`.
