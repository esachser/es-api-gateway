# Maestro API Gateway

Welcome to the documentation of the Maestro API Gateway.

## About the Gateway

The Maestro API Gateway aims to be a point of integration for REST APIs,
primarly,
but also an integrator to easily communicate between (micro-)services.

The structure of the implementation makes a simple way of:
* Getting in a request, queue, stream
* Make some process on:
    * Transformation
    * Authorization
    * Security
    * Integration with other systems
    * Call a internal REST, GRPC, service

* Return, if intended, a response

The 2 basic actors on that pipeline are the **Transports** and the **Middlewares**
