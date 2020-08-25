"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsOpenApiVerifyMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const oas3_chow_chow_1 = __importDefault(require("oas3-chow-chow"));
const errors_1 = require("../core/errors");
const parsers_1 = __importDefault(require("../core/parsers"));
const middlewares_1 = require("../core/middlewares");
let EsOpenApiVerifyMiddleware = /** @class */ (() => {
    class EsOpenApiVerifyMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._propMethod = '';
            this._propUrl = '';
            this._propBody = '';
            this._propHeaders = '';
            this._propQuery = '';
            this._propParams = '';
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                const oas = lodash_1.default.get(values, 'oas', {});
                try {
                    const api = yield swagger_parser_1.default.validate(oas);
                    const openapiVersion = lodash_1.default.get(api, 'openapi', '');
                    if (lodash_1.default.toString(openapiVersion).startsWith('3.')) {
                        this._oasValidator = new oas3_chow_chow_1.default(api);
                        this._propResult = lodash_1.default.get(values, 'propResult');
                        this._throw = lodash_1.default.get(values, 'throw');
                        this._propMethod = lodash_1.default.get(values, 'method', 'request.method');
                        this._propUrl = lodash_1.default.get(values, 'url', 'request.path');
                        this._propBody = lodash_1.default.get(values, 'body', 'request.body');
                        this._propHeaders = lodash_1.default.get(values, 'headers', 'request.headers');
                        this._propQuery = lodash_1.default.get(values, 'query', 'request.query');
                        this._propParams = lodash_1.default.get(values, 'params', 'request.params');
                    }
                    else {
                        throw new errors_1.EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'The OpenAPI version MUST be 3.x.x');
                    }
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'Error creating OpenAPI validator', err);
                }
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._oasValidator !== undefined) {
                    const method = lodash_1.default.get(context.properties, this._propMethod);
                    let path = lodash_1.default.get(context.properties, this._propUrl, '');
                    const body = lodash_1.default.get(context.properties, this._propBody);
                    const headers = lodash_1.default.get(context.properties, this._propHeaders);
                    const query = lodash_1.default.get(context.properties, this._propQuery, {});
                    const params = lodash_1.default.get(context.properties, this._propParams, {});
                    if (!path.startsWith('/')) {
                        path = `/${path}`;
                    }
                    try {
                        // Fazer parsing do body para JSON, mesmo que venha XML ou outra coisa.
                        const json = yield parsers_1.default.transform(body, {
                            bta: {
                                parser: 'EsJson'
                            }
                        });
                        const reqMeta = this._oasValidator.validateRequestByPath(path, method, { body: json, path: params, header: headers, query });
                        context.logger.debug('OAS Validator result', lodash_1.default.merge({}, reqMeta, EsOpenApiVerifyMiddleware.meta, context.meta));
                        if (this._propResult !== undefined) {
                            lodash_1.default.set(context.properties, this._propResult, reqMeta);
                        }
                    }
                    catch (err) {
                        if (this._propResult !== undefined) {
                            lodash_1.default.set(context.properties, this._propResult, undefined);
                        }
                        if (Boolean(this._throw)) {
                            throw new errors_1.EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'Error verifying OpenAPI Request', { message: err.message, name: err.name, stack: err.stack }, 'Invalid body or parameters', 400);
                        }
                        else {
                            context.logger.error('Error verifying OpenAPI Request', lodash_1.default.merge({ message: err.message, name: err.name, stack: err.stack }, EsOpenApiVerifyMiddleware.meta));
                        }
                    }
                }
            });
        }
    }
    EsOpenApiVerifyMiddleware.isInOut = true;
    EsOpenApiVerifyMiddleware.middlewareName = 'EsOpenApiVerifyMiddleware';
    EsOpenApiVerifyMiddleware.meta = { middleware: EsOpenApiVerifyMiddleware.middlewareName };
    return EsOpenApiVerifyMiddleware;
})();
exports.EsOpenApiVerifyMiddleware = EsOpenApiVerifyMiddleware;
;
exports.MiddlewareCtor = EsOpenApiVerifyMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsOpenApiVerifyMiddleware",
    "title": "OpenApiVerify Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "oas",
        "throw"
    ],
    "properties": {
        "oas": {
            "type": "object"
        },
        "throw": {
            "type": "boolean"
        },
        "propResult": {
            "type": "string"
        },
        "method": {
            "type": "string"
        },
        "url": {
            "type": "string"
        },
        "body": {
            "type": "string"
        },
        "headers": {
            "type": "string"
        },
        "query": {
            "type": "string"
        },
        "params": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=openapiverify-middleware.js.map