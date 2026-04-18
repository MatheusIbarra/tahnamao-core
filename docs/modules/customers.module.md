# Module Spec - customers

## Responsabilidade

Gerenciar cadastro, autenticacao, perfil e enderecos salvos do cliente, alem de fornecer listagem e bloqueio/desbloqueio para rotas administrativas.

## Entradas

- dados de cadastro do cliente (`name`, `email`, `phone`, `password`)
- credenciais de login de cliente (`email` + `password`)
- comandos de atualizacao de perfil
- comandos de CRUD de enderecos do cliente
- comandos administrativos de listagem, bloqueio e desbloqueio de clientes

## Saidas

- perfil do cliente autenticado
- tokens de acesso e refresh para cliente
- colecao de enderecos ativos do cliente com suporte a endereco default
- lista administrativa de clientes com filtros por nome/email e paginação

## Portas

- `AuthService` (tokens/refresh/logout)
- `ViaCepClient` (sugestao de endereco por CEP)
