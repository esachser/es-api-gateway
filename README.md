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
- [**Não faz sentido**] ForEach Middleware
- [**OK**] Cada Path no transporte HTTP pode ter middlewares
- [**OK**] OpenAPIVerify Middleware deve retornar erro ou setar variável
- Criar OAuth2 Middleware
  - [**OK**] JWKS
  - [**OK**] Inspect
  - [**OK**] Escopos via propriedade
- [**OK**] Erros na execução do middleware geram retorno padrão
- [**OK**] Remover uso do vm2 para usar vm
- [**OK**] Execute JS middleware
- Parsers de entrada, saída, e transformação
  - **Entrada**: Executar transformação de Buffer para any
  - **Saída**: Executar transformação de any para Buffer
  - **Transformação**: Executar transformação de Buffer para Buffer
  - [**OK**] JSON parser
  - [**OK**] Compression parser
  - [**OK**] String parser
  - [**OK**] Form parser
  - [**OK**] XML parser
  - [**Não processará**] Multipart parser
  - [**OK**] Media type parser
    - [**OK**] Sempre obedecendo um media-type
- [**OK**] YAML API
- [**OK**] Decode Middleware
- [**OK**] Encode Middleware
- [**Usar Parse Middleware**] HttpRequest Middleware deve ter a possibilidade de fazer parsing ou não do retorno
- [**OK**] Estudar chamada de GRPC
  - [**OK**] Adicionar middleware cliente GRPC - com SSL
    - Por enquanto somente chamadas e respostas unárias, sem stream
- [**OK**] Certificados em diretório
  - [**OK**] Um diretório para cada api
- [**OK**] Load Private Key Middleware
- [**OK**] Load Public Certificate Middleware
- [**OK**] Gerar JWS Middleware
- [**OK**] Verificar JWS Middleware
- [**OK**] Gerar JWE Middleware
- [**OK**] Verificar/Decriptar JWE Middleware
- [**OK**] Salvar no Redis um registro Middleware
- [**OK**] Capturar no Redis um registro Middleware
- Rate Limiting - Por servidor (instalação, em memória)
- Quotas - Por alguma coisa, p.ex. usuário, ip, client_id, etc. (usa Redis)
- Incluir o nome da API (id) no construtor padrão
- Chamada HTTP com certificado de cliente
- Limite de tamanho do body no getRawBody
- Compound Middleware --> Middlewares personalizados
- init_mid --> transport_mid --> execution_mid
- Adicionar transporte GRPC
- Adicionar transporte Kafka
- Adicionar transporte Redis Pub/Sub
- Adicionar transporte Redis Streams
- Adicionar transportes de filas
  - AMQP
  - MQTT
- Adicionar facilidades para gerar JWT
  - Com issuer
  - jti
  - exp
  - ...
- Trocar o verificador de OpenAPI
- Estudar a adição dos conceitos SOAP
- Tipos de Logger na configuração global
- APIs como JWE, para encriptar informações sensíveis

## Outros pontos

Outros pontos a serem verificados:

- Verificar concorrência nos *creators*
- Criar testes para todo o sistema
- Criar "Vault" para salvar infos das APIs
