# Health Contract

## Endpoint

- `GET /api/v1/health/live`
- `GET /api/v1/health/ready`

## `GET /health/live`

Retorna saude do processo.

### Response `200`

```json
{
  "status": "ok",
  "service": "tahnamao-core",
  "version": "0.1.0",
  "timestamp": "2026-04-18T13:20:00.000Z",
  "checks": [
    { "dependency": "process", "status": "up", "details": "running" }
  ]
}
```

## `GET /health/ready`

Retorna prontidao de dependencias minimas.

### Response `200`

Mongo disponivel.

### Response `503`

Mongo indisponivel.
