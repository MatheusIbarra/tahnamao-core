# Module Spec - identity

## Responsabilidade

Autenticacao e autorizacao com tokens e claims.

## Entradas

- credenciais de login
- refresh token

## Saidas

- access token
- claims para RBAC

## Portas

- `AuthTokenPort`
- `PasswordHasherPort`
- `UserRepositoryPort`
- `AuditTrailPort`
