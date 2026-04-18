# Dependency Rules

## Regra principal

Dependencias sempre apontam para dentro:

- `presentation -> application -> domain`
- `infrastructure -> application/domain` (implementacao de ports)

## Proibicoes

- `domain` importando `@nestjs/*`
- `domain` importando `mongoose`
- `application` contendo decorators HTTP
- `presentation` implementando regra de negocio critica

## Checklist por PR

- [ ] Alguma regra critica foi movida para fora da API?
- [ ] Houve vazamento de classe de infra no dominio/aplicacao?
- [ ] Novas dependencias respeitam sentido das camadas?
