# Customers Contract

## Endpoints de cadastro e autenticacao

- `POST /api/v1/customers/register`
- `POST /api/v1/customers/auth/login`
- `POST /api/v1/customers/auth/refresh`
- `POST /api/v1/customers/auth/logout`

## Endpoints de perfil

- `GET /api/v1/customers/me`
- `PATCH /api/v1/customers/me`

## Endpoints de enderecos

- `POST /api/v1/customers/me/addresses`
- `GET /api/v1/customers/me/addresses`
- `GET /api/v1/customers/me/addresses/{id}`
- `PATCH /api/v1/customers/me/addresses/{id}`
- `DELETE /api/v1/customers/me/addresses/{id}`
- `PATCH /api/v1/customers/me/addresses/{id}/default`

## Regras de negocio e seguranca

- Cadastro exige `name`, `email`, `phone`, `password`.
- `email` e `phone` devem ser unicos por cliente.
- Senha de cliente e persistida como `passwordHash` com `bcrypt`.
- Login de cliente usa `email + senha` e retorna `accessToken` + `refreshToken`.
- Todas as rotas `/customers/me/*` exigem token Bearer valido para `AuthUserType.CUSTOMER`.
- Endereco exige CEP com 8 digitos numericos.
- Para CEP valido, o backend tenta sugestao de logradouro/bairro/cidade/estado via ViaCEP.
- Se ViaCEP nao retornar dados suficientes, o cliente deve fornecer campos obrigatorios manualmente.
- So pode existir 1 endereco ativo como `isDefault=true` por cliente; ao definir novo default o anterior e desmarcado.
- Remocao de endereco e soft delete (`isActive=false`).
