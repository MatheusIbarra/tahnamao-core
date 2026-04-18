# Module Spec - deliveries

## Responsabilidade

Gerenciar o ciclo de vida de solicitacoes de entrega.

## Entradas

- requisicoes de criacao/atualizacao de entrega
- comandos de atribuicao/aceite

## Saidas

- estado atual da entrega
- eventos de dominio para tracking e auditoria

## Portas

- `DeliveryRepositoryPort`
- `DomainEventPublisherPort`
- `AuditTrailPort`
