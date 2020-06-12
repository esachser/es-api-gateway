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
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const oas3_chow_chow_1 = __importDefault(require("oas3-chow-chow"));
const errors_1 = require("../core/errors");
let EsOpenApiVerifyMiddleware = /** @class */ (() => {
    class EsOpenApiVerifyMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            this.values = {};
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                const oas = lodash_1.default.get(values, 'oas', {});
                try {
                    const api = yield swagger_parser_1.default.validate(oas);
                    const openapiVersion = lodash_1.default.get(api, 'openapi', '');
                    if (lodash_1.default.toString(openapiVersion).startsWith('3.')) {
                        this.oasValidator = new oas3_chow_chow_1.default(api);
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
                if (this.oasValidator !== undefined) {
                    const method = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'method', 'request.method'));
                    let path = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'url', 'request.path'), '');
                    const body = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'body', 'request.body'));
                    const headers = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'headers', 'request.headers'));
                    const query = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'query', 'request.query'), {});
                    const params = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'params', 'request.params'), {});
                    if (!path.startsWith('/')) {
                        path = `/${path}`;
                    }
                    const reqMeta = this.oasValidator.validateRequestByPath(path, method, { body, path: params, header: headers, query });
                    if (reqMeta === undefined) {
                        throw Error('Invalid request');
                    }
                }
            });
        }
    }
    EsOpenApiVerifyMiddleware.isInOut = true;
    EsOpenApiVerifyMiddleware.middlewareName = 'EsOpenApiVerifyMiddleware';
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
        "oas"
    ],
    "properties": {
        "oas": {
            "type": "object"
        }
    }
};
//# sourceMappingURL=openapiverify-middleware.js.map