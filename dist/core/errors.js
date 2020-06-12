"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsMiddlewareError = exports.EsTransportError = exports.EsApiCreationError = void 0;
class EsApiCreationError extends Error {
    constructor(api, message) {
        super(message);
        this.api = api;
    }
}
exports.EsApiCreationError = EsApiCreationError;
;
class EsTransportError extends Error {
    constructor(transport, message) {
        super(message);
        this.transport = transport;
    }
}
exports.EsTransportError = EsTransportError;
;
class EsMiddlewareError extends Error {
    constructor(middleware, message) {
        super(message);
        this.middleware = middleware;
    }
}
exports.EsMiddlewareError = EsMiddlewareError;
;
//# sourceMappingURL=errors.js.map