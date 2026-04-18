# Customers Contract

## Endpoints de cadastro e autenticacao

- `POST /api/v1/customers/register`
- `POST /api/v1/customers/auth/login`
- `POST /api/v1/customers/auth/refresh`
- `POST /api/v1/customers/auth/logout`

## Endpoints de perfil

- `GET /api/v1/customers/me`
- `PATCH /api/v1/customers/me`
- `PATCH /api/v1/customers/me/password`

## Endpoints de enderecos

- `POST /api/v1/customers/me/addresses`
- `GET /api/v1/customers/me/addresses`
- `GET /api/v1/customers/me/addresses/{id}`
- `PATCH /api/v1/customers/me/addresses/{id}`
- `DELETE /api/v1/customers/me/addresses/{id}`
- `PATCH /api/v1/customers/me/addresses/{id}/default`

## Endpoints administrativos de clientes

- `GET /api/v1/admin/clients`
- `GET /api/v1/admin/clients/{customerId}`
- `POST /api/v1/admin/clients/{customerId}/block`
- `POST /api/v1/admin/clients/{customerId}/unblock`

## Regras de negocio e seguranca

- Cadastro exige `name`, `email`, `phone`, `password`.
- `email` e `phone` devem ser unicos por cliente.
- `email` nao pode ser alterado apos cadastro.
- Senha de cliente e persistida como `passwordHash` com `bcrypt`.
- Login de cliente usa `email + senha` e retorna `accessToken` + `refreshToken`.
- Troca de senha exige `currentPassword` valido antes de persistir `newPassword`.
- Todas as rotas `/customers/me/*` exigem token Bearer valido para `AuthUserType.CUSTOMER`.
- Rotas `admin/clients/*` exigem token admin valido (`role=admin`).
- Endereco exige CEP com 8 digitos numericos.
- Para CEP valido, o backend tenta sugestao de logradouro/bairro/cidade/estado via ViaCEP.
- Se ViaCEP nao retornar dados suficientes, o cliente deve fornecer campos obrigatorios manualmente.
- So pode existir 1 endereco ativo como `isDefault=true` por cliente; ao definir novo default o anterior e desmarcado.
- Remocao de endereco e soft delete (`isActive=false`).
