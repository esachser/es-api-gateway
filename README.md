# ES API Gateway e Enterprise Service Bus

## Transportes

## Middlewares

## APIs

## TODO

Aspectos que devem ser vistos:

- [**OK**] Carga dos middlewares e transportes no core
- [**OK**] Verificar se o prefixo já não está utilizado no transporte http
- [**OK**] Não carregar middleware ou transporte cujo esquema estiver incorreto
- [**OK**] Criar construtor assíncrono para garantir que o load dos middlewares está acontecendo
- [**OK**] Não permitir criação da API em caso de erro em qualquer parte da criação
  - [**OK**] Criar extensão de error para representar isso.
- [**OK**] Refatorar middleware base para classes abstratas
  - [**OK**] **after** deve ser padrão na definição
  - [**OK**] **execute** deve seguir ou não o **after**
  - [**OK**] **runInternal** deve ser implementado
- [**OK**] Configuração logger para cada API
- Verificar possibilidade de usar Event Emitter
- Tipos de Logger na configuração global
- Cada Path no transporte HTTP pode ter middlewares
- Criar Throw Error Middleware
- Criar Catch Error Middleware
- ForEach Middleware
- OpenAPIVerify Middleware deve retornar erro ou setar variável
- Criar OAuth2 Middleware
  - Inspect ou JWKS
  - Escopos via propriedade
- Parsers de entrada e saída
  - **Entrada**: Executar transformação de Buffer para JSON
  - **Saída**: Executar transformação de JSON para BUffer
  - Sempre obedecendo um media-type
- HttpRequest Middleware deve ter a possibilidade de fazer parsing ou não do retorno

