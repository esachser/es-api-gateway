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
- [**OK**] Rate Limiting - Por servidor (instalação, em memória)
- [**OK**] Quotas - Por alguma coisa, p.ex. usuário, ip, client_id, etc. (usa Redis)
- [**OK**] Incluir o nome da API (id) no construtor padrão
- [**OK**] Chamada HTTP com certificado de cliente - Testar melhor
- [**OK**] Tornar getRawBody um middleware
- [**OK**] Limite de tamanho do body no getRawBody
- [**OK**] Compound Middleware --> Middlewares personalizados
- [**OK**] init_mid --> transport_mid --> execution_mid
- [**OK**] Várias portas HTTP com configurações diferentes
  - [**OK**] Fazer a recarga de todas elas corretamente
- [**OK**] Adicionar "transporte" Scheduler
- [**OK**] Adicionar transporte/middleware Redis Pub/Sub
  - [**OK**] Middleware Pub
  - [**OK**] Transport Sub
- [**OK**] Adicionar transporte/middleware Redis Streams
  - [**OK**] Middleware Stream Write
  - [**OK**] Transport Group Stream Read
- [**OK**] Rodar gateway em cluster
- [**OK**] Criar tag de API desabilitada
- [**OK**] Criar tag de transporte habilitado
- Centralizar configuração de Redis
  - [**OK**] Verificar configuração do Redis como um todo
  - [**OK**] Configuração de redis publisher para os logs das APIs
  - [**OK**] Configuração de redis como objeto para cada middleware ou transporte
- [**OK**] Avaliar uso de ETCD para escala horizontal dos clusters
  - [**OK**] Será usado
  - [**OK**] Usar para quotaLimiter
  - Utilizar como replicação de cluster
- Adicionar middleware de envio de email
  - Exige configuração centralizada?
- Adicionar transporte Kafka
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
- Parâmetros configuráveis para os middlewares criados (e todos os middlewares)
  - Algo do tipo ${request.headers.test}
- Validar configuração global

## Outros pontos

Outros pontos a serem verificados:

- Adicionar transporte GRPC
- Verificar concorrência nos *creators*
- Criar testes para todo o sistema
- Criar "Vault" para salvar infos das APIs
