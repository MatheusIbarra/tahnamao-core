# Identity + Driver Onboarding Contract

## Endpoints de autenticacao

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/admin/auth/login`

## Endpoints do motorista

- `POST /api/v1/drivers`
- `PATCH /api/v1/drivers/me`
- `POST /api/v1/drivers/me/password`
- `POST /api/v1/drivers/me/documents`
- `POST /api/v1/drivers/me/submit`
- `GET /api/v1/drivers/me/onboarding-status`
- `POST /api/v1/drivers/me/documents/{type}/resubmit`

## Endpoints administrativos

- `GET /api/v1/admin/drivers/pending`
- `GET /api/v1/admin/drivers/{driverId}`
- `POST /api/v1/admin/drivers/{driverId}/approve`
- `POST /api/v1/admin/drivers/{driverId}/reject`
- `POST /api/v1/admin/drivers/{driverId}/block`
- `POST /api/v1/admin/drivers/{driverId}/unblock`
- `POST /api/v1/admin/drivers/{driverId}/documents/{documentId}/approve`
- `POST /api/v1/admin/drivers/{driverId}/documents/{documentId}/reject`

## Observacoes de seguranca

- Login por CPF+senha, sem OTP no MVP.
- Refresh token persistido no banco como hash.
- Rotas operacionais devem exigir `driver.status == APPROVED`.
- Rotas `admin/*` exigem token com claim `role = admin`.
- Sem permissionamento granular no MVP: qualquer admin autenticado possui acesso total nas rotas administrativas.
