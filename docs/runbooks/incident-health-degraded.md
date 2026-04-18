# Runbook - Health Degraded

## Sintoma

`/health/ready` retorna `503`.

## Diagnostico rapido

1. Verificar conectividade com MongoDB.
2. Verificar variavel `MONGODB_URI`.
3. Verificar disponibilidade de rede e credenciais.

## Acao

1. Restaurar conectividade.
2. Reiniciar aplicacao apenas se necessario.
3. Registrar incidente e causa raiz em auditoria operacional.
