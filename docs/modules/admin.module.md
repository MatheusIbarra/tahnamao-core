# Module Spec - admin

## Responsabilidade

Expor rotas administrativas protegidas por autenticacao dedicada de admin, sem RBAC granular no MVP.

## Entradas

- credenciais de login admin (`email` + senha) em rota dedicada
- token JWT admin com claim `role=admin`
- comandos administrativos para revisao de motoristas/documentos
- consultas administrativas de clientes e pedidos

## Saidas

- access token admin para consumo de rotas `/admin/*`
- refresh token admin e rota `POST /admin/auth/refresh` (sem bearer; corpo `{ refreshToken }`)
- respostas de operacao administrativa (`approve`, `reject`, `block`, `unblock`)
- listagens administrativas com filtros/paginacao (`/admin/drivers`, `/admin/clients`, `/admin/orders`)
- snapshots de detalhe para telas do painel (`/admin/drivers/{id}`, `/admin/clients/{id}`, `/admin/orders/{id}`)

## Guardrails

- toda rota sob `/admin/*` exige claim `role=admin`
- tokens sem claim admin devem receber `403` com mensagem clara
- nao existe permissionamento granular no MVP (acesso total para admin autenticado)
