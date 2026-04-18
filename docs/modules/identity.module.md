# Module Spec - identity

## Responsabilidade

Autenticacao e autorizacao para motoristas e administradores, com login dedicado por perfil, emissao de tokens e bloqueio por tentativas falhas.

## Entradas

- credenciais de login de motorista (`CPF` + senha)
- credenciais de login de admin (`email` + senha)
- refresh token de motorista
- refresh token de admin
- definicao de senha para conta de motorista

## Saidas

- access token de motorista com claims de status/scopes
- access token de admin com claim `role=admin`
- refresh token opaco para motorista e admin (coleção compartilhada, `userType` distinto)
- trilha de tentativas de login

## Portas

- `AuthTokenPort`
- `PasswordHasherPort`
- `UserRepositoryPort`
- `AuditTrailPort`
