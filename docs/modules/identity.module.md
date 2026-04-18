# Module Spec - identity

## Responsabilidade

Autenticacao e autorizacao com login por CPF+senha, emissao de access/refresh token e bloqueio por tentativas falhas.

## Entradas

- credenciais de login (`CPF` + senha)
- refresh token
- definicao de senha para conta de motorista

## Saidas

- access token com claims de status/scopes
- refresh token opaco
- trilha de tentativas de login

## Portas

- `AuthTokenPort`
- `PasswordHasherPort`
- `UserRepositoryPort`
- `AuditTrailPort`
