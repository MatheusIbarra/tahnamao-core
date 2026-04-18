# BR-0003 Customer Auth, Profile and Addresses

## Contexto

Define as regras do MVP para cadastro de clientes, autenticacao com tokens e gerenciamento de enderecos salvos.

## Regras

1. Cadastro de cliente exige `name`, `email`, `phone` e `password`.
2. `email` e `phone` devem ser unicos para cada cliente.
3. Senha do cliente deve ser persistida apenas como hash (`bcrypt`), nunca em texto puro.
4. Cliente com `status=BLOCKED` nao pode autenticar nem renovar sessao.
5. Rotas de perfil e enderecos exigem token com `ut=CUSTOMER`.
6. CEP deve possuir exatamente 8 digitos numericos.
7. Backend consulta ViaCEP para sugerir logradouro/bairro/cidade/estado com base no CEP.
8. Se ViaCEP estiver indisponivel ou incompleto, os campos obrigatorios de endereco devem ser informados manualmente.
9. Cada cliente pode ter no maximo um endereco ativo marcado como default.
10. Ao definir novo default, o endereco default anterior deve ser desmarcado automaticamente.
11. Exclusao de endereco e logica (`isActive=false`) para preservar historico.

## Invariantes

- Endereco ativo exige `cep`, `logradouro`, `numero`, `bairro`, `cidade`, `estado`.
- `estado` deve usar sigla UF com 2 caracteres.
- Listagem de enderecos retorna apenas registros ativos do cliente autenticado.

## Impacto de contrato

- Mudancas nessas regras exigem atualizacao de OpenAPI e contratos em `docs/contracts/api`.
