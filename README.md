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
  - [**OK**] Logger Redis por API
- [**OK**] Criar Throw Error Middleware
- [**OK**] Criar Catch Error Middleware
  - Setar tipo de response padrão por path
- [**Não faz sentido**]ForEach Middleware
- [**OK**] Cada Path no transporte HTTP pode ter middlewares
- [**OK**] OpenAPIVerify Middleware deve retornar erro ou setar variável
- Criar OAuth2 Middleware
  - [**OK**] JWKS
  - [**OK**] Inspect
  - [**OK**] Escopos via propriedade
- [**OK**] Erros na execução do middleware geram retorno padrão
- [**OK**] Remover uso do vm2 para usar vm
- [**OK**] Execute JS middleware
- Parsers de entrada e saída
  - **Entrada**: Executar transformação de Buffer para JSON
  - **Saída**: Executar transformação de JSON para BUffer
  - Sempre obedecendo um media-type
- HttpRequest Middleware deve ter a possibilidade de fazer parsing ou não do retorno
- Estudar a adição dos conceitos SOAP
- Estudar chamada de GRPC
- Tipos de Logger na configuração global
- Gerar JWS Middleware
- Verificar JWS Middleware
- Gerar JWE Middleware
- Verificar/Decriptar JWE Middleware
- Salvar no Redis um registro Middleware
- Rate Limiting
- Quotas
- init_mid --> transport_mid --> execution_mid

## Outros pontos

Outros pontos a serem verificados:

- Verificar concorrência nos *creators*

