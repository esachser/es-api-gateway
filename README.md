# ES API Gateway e Enterprise Service Bus

## Transportes

## Middlewares

## APIs

## TODO

Aspectos que devem ser vistos:

- [**OK**] Carga dos middlewares e transportes no core
- [**OK**] Verificar se o prefixo já não está utilizado no transporte http
- [**OK**] Não carregar middleware ou transporte cujo esquema estiver incorreto
- Não permitir criação da API em caso de erro em qualquer parte da criação
  - Criar extensão de error para representar isso.
- [**OK**] Refatorar middleware base para classes abstratas
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
  - Inspect ou JWKS
  - Escopos via propriedade
- Parsers de entrada e saída
  - **Entrada**: Executar transformação de Buffer para JSON
  - **Saída**: Executar transformação de JSON para BUffer
  - Sempre obedecendo um media-type
- HttpRequest Middleware deve ter a possibilidade de fazer parsing ou não do retorno

