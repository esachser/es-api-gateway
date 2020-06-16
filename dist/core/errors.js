"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsSchemaError = exports.EsMiddlewareError = exports.EsTransportError = exports.EsApiCreationError = void 0;
class EsApiCreationError extends Error {
    constructor(api, message) {
        super(message);
        this.api = api;
    }
}
exports.EsApiCreationError = EsApiCreationError;
;
class EsTransportError extends Error {
    constructor(transport, message, error) {
        super(message);
        this.transport = transport;
        this.error = error;
    }
}
exports.EsTransportError = EsTransportError;
;
class EsMiddlewareError extends Error {
    constructor(middleware, message, error) {
        super(message);
        this.middleware = middleware;
        this.error = error;
    }
}
exports.EsMiddlewareError = EsMiddlewareError;
;
class EsSchemaError extends Error {
    constructor(schemaName, message, error) {
        super(message);
        this.schemaName = schemaName;
        this.error = error;
    }
}
exports.EsSchemaError = EsSchemaError;
;
//# sourceMappingURL=errors.js.map