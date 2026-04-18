# Module Spec - drivers

## Responsabilidade

Gerenciar perfil, status de onboarding, documentacao do motorista e elegibilidade operacional.

## Entradas

- dados cadastrais do motorista
- uploads de documentos versionados
- comandos administrativos de aprovacao/rejeicao/bloqueio

## Saidas

- status de onboarding por motorista
- fila de motoristas pendentes para revisao
- snapshot de documentos para analise do admin

## Portas

- `FilesService` (referencia de arquivo)
- `DriverApprovalReviewsService`
- `AdminActionsAuditService`
