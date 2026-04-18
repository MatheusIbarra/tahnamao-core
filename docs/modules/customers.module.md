# Module Spec - customers

## Responsabilidade

Gerenciar cadastro, autenticacao, perfil e enderecos salvos do cliente.

## Entradas

- dados de cadastro do cliente (`name`, `email`, `phone`, `password`)
- credenciais de login de cliente (`email` + `password`)
- comandos de atualizacao de perfil
- comandos de CRUD de enderecos do cliente

## Saidas

- perfil do cliente autenticado
- tokens de acesso e refresh para cliente
- colecao de enderecos ativos do cliente com suporte a endereco default

## Portas

- `AuthService` (tokens/refresh/logout)
- `ViaCepClient` (sugestao de endereco por CEP)
