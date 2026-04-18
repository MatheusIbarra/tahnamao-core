# BR-0002 Driver Auth and Manual Approval

## Contexto

Define as regras do MVP para autenticacao por CPF+senha e onboarding de motorista com aprovacao 100% manual por admin.

## Regras

1. Login principal do motorista e por `CPF` + `senha`.
2. CPF e normalizado (somente digitos), validado por digitos verificadores e deve ser unico para motoristas ativos.
3. Documento de login tambem deve ser unico em `auth_accounts`.
4. Antes da aprovacao (`status != APPROVED`), o motorista nao pode acessar rotas operacionais.
5. Motorista `PENDING_REVIEW` pode logar apenas para acompanhar status de cadastro.
6. Motorista `REJECTED` pode reenviar documentos e voltar para `PENDING_REVIEW` ao submeter novamente.
7. Motorista `BLOCKED` nao pode logar nem renovar sessao.
8. Todo documento enviado e versionado por `(driverId, type, version)` e historico anterior nao pode ser alterado.
9. Toda aprovacao, rejeicao e bloqueio exige motivo registrado em `driver_approval_reviews` e `admin_actions_audit`.
10. Upload de documento deve respeitar whitelist de mime types e limite de tamanho.
11. Admin utiliza fluxo dedicado de autenticacao e nao compartilha endpoint de login com motorista/cliente.
12. Tokens de admin devem conter claim `role=admin` para acesso a rotas `admin/*`.
13. No MVP nao existe RBAC granular para admin: qualquer admin autenticado tem acesso total ao escopo administrativo.

## Invariantes

- Deve existir no minimo `SELFIE` e pelo menos um documento oficial com foto (`RG_FRONT` ou `CNH_FRONT`) para submissao final.
- `auth_refresh_tokens` deve persistir somente hash de token, nunca token puro.
- Senha deve obedecer regra minima de forca.

## Matriz de acesso por status

| Status | Login | Onboarding | Operacional |
|--------|-------|------------|-------------|
| `DRAFT` | Sim | Sim | Nao |
| `PENDING_REVIEW` | Sim | Somente status | Nao |
| `APPROVED` | Sim | Sim | Sim |
| `REJECTED` | Sim | Reenvio permitido | Nao |
| `BLOCKED` | Nao | Nao | Nao |

## Impacto de contrato

- Mudancas nessas regras exigem atualizacao de OpenAPI e colecao Postman derivada.
