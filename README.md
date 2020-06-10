# ES API Gateway e Enterprise Service Bus

## Transportes

## TODO

Aspectos que devem ser vistos:

- Configuração logger para cada API
- Tipos de Logger na configuração global
- Cada Path no transporte HTTP pode ter middlewares
- Criar Throw Error Middleware
- Criar Catch Error Middleware
- Criar OAuth2 Middleware
  - Inpect ou JWKS
  - Escopos via propriedade
- OpenAPIVerify Middleware deve retornar erro ou setar variável
- HttpRequest Middleware deve ter a possibilidade de 
- Refatorar middleware base para classes abstratas
  - **after** deve ser padrão na definição
  - **execute** deve seguir ou não o **after**
  - **runInternal** deve ser implementado
- Parsers de entrada e saída
  - **Entrada**: Executar transformação de Buffer para JSON
  - **Saída**: Executar transformação de JSON para BUffer
  - Sempre obedecendo um media-type
