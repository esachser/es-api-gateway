# ES API Gateway e Enterprise Service Bus

## Transportes

## Middlewares

## APIs

## TODO

Aspectos que devem ser vistos:

- [**OK**] Carga dos middlewares e transportes no core
- [] Verificar se o prefixo já não está utilizado no transporte http
- Não permitir criação da API em caso de erro em qualquer parte da criação
- Refatorar middleware base para classes abstratas
  - **after** deve ser padrão na definição
  - **execute** deve seguir ou não o **after**
  - **runInternal** deve ser implementado
- Configuração logger para cada API
- Tipos de Logger na configuração global
- Cada Path no transporte HTTP pode ter middlewares
- Criar Throw Error Middleware
- Criar Catch Error Middleware
- OpenAPIVerify Middleware deve retornar erro ou setar variável
- Criar OAuth2 Middleware
  - dkjf
  - Inspect ou JWKS
  - Escopos via propriedade
- Parsers de entrada e saída
  - **Entrada**: Executar transformação de Buffer para JSON
  - **Saída**: Executar transformação de JSON para BUffer
  - Sempre obedecendo um media-type
- HttpRequest Middleware deve ter a possibilidade de fazer parsing ou não do retorno

