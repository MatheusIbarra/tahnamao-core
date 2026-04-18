# Changelog Tecnico - identity

## 0.3.0

- Adiciona autenticacao administrativa dedicada em `POST /admin/auth/login`.
- Adiciona claim JWT `role=admin` e validacao obrigatoria para rotas `admin/*`.
- Remove dependencia de header manual `x-admin-id` no fluxo administrativo.

## 0.2.0

- Adiciona login de motorista por CPF+senha com bloqueio por tentativas falhas.
- Adiciona emissao e rotacao de refresh token com hash persistido.
- Adiciona endpoints de onboarding de motorista e gates de status para uso operacional.

## 0.1.0

- Definicao inicial de responsabilidades e contratos de autenticacao/autorizacao.
