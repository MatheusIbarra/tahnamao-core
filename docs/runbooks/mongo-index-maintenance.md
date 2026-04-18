# Runbook - Mongo Index Maintenance

## Objetivo

Garantir indices alinhados com padrao de consulta e contratos de modulo.

## Politica

- Toda alteracao de indice deve ter justificativa tecnica e impacto documentado.
- Mudancas devem ser revisadas com risco de lock/performance.

## Passos

1. Documentar indice no modulo afetado.
2. Aplicar em ambiente de homologacao.
3. Validar query plan.
4. Promover para producao com janela controlada.
