# Module Spec - admin

## Responsabilidade

Expor rotas administrativas protegidas por autenticacao dedicada de admin, sem RBAC granular no MVP.

## Entradas

- credenciais de login admin (`email` + senha) em rota dedicada
- token JWT admin com claim `role=admin`
- comandos administrativos para revisao de motoristas e documentos

## Saidas

- access token admin para consumo de rotas `/admin/*`
- respostas de operacao administrativa (`approve`, `reject`, `block`, `unblock`)

## Guardrails

- toda rota sob `/admin/*` exige claim `role=admin`
- tokens sem claim admin devem receber `403` com mensagem clara
- nao existe permissionamento granular no MVP (acesso total para admin autenticado)
