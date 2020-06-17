"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsAuthenticatorError = exports.EsSchemaError = exports.EsMiddlewareError = exports.EsTransportError = exports.EsApiCreationError = exports.EsError = void 0;
class EsError {
    constructor(error, errorDescription, statusCode, innerError) {
        this.error = error || 'Error';
        this.errorDescription = errorDescription || 'Contact administrator for more details';
        this.statusCode = statusCode || 500;
        this.innerError = innerError;
        Error.captureStackTrace(this);
    }
}
exports.EsError = EsError;
class EsApiCreationError extends EsError {
    constructor(api, message, innerError, errorDescription, statusCode) {
        super(message, errorDescription, statusCode, innerError);
        this.api = api;
    }
}
exports.EsApiCreationError = EsApiCreationError;
;
class EsTransportError extends EsError {
    constructor(transport, message, innerError, errorDescription, statusCode) {
        super(message, errorDescription, statusCode, innerError);
        this.transport = transport;
    }
}
exports.EsTransportError = EsTransportError;
;
class EsMiddlewareError extends EsError {
    constructor(middleware, message, innerError, errorDescription, statusCode) {
        super(message, errorDescription, statusCode, innerError);
        this.middleware = middleware;
    }
}
exports.EsMiddlewareError = EsMiddlewareError;
;
class EsSchemaError extends EsError {
    constructor(schemaName, message, innerError, errorDescription, statusCode) {
        super(message, errorDescription, statusCode, innerError);
        this.schemaName = schemaName;
    }
}
exports.EsSchemaError = EsSchemaError;
;
class EsAuthenticatorError extends EsError {
    constructor(authenticator, message, innerError, errorDescription, statusCode) {
        super(message, errorDescription, statusCode, innerError);
        this.authenticator = authenticator;
    }
}
exports.EsAuthenticatorError = EsAuthenticatorError;
;
//# sourceMappingURL=errors.js.map