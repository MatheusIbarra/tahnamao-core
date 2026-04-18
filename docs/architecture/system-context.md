# System Context

## Papel do `tahnamao-core`

`tahnamao-core` e a camada soberana de decisao para regras de negocio e seguranca:

- autenticacao/autorizacao
- aprovacao cadastral
- trilha de auditoria
- regras operacionais de entregas
- base para financeiro e saques
- contratos de integracao internos

## Consumidores

- aplicativos clientes (futuro)
- integracoes internas
- admin em Next.js via proxy seguro/Server Actions

## Diretriz essencial

Nenhuma regra critica pode viver no admin. O admin e um consumidor confiavel, mas nunca autoridade de validacao.
