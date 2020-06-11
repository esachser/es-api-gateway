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
const logger_1 = require("../util/logger");
const swagger_parser_1 = __importDefault(require("@apidevtools/swagger-parser"));
const oas3_chow_chow_1 = __importDefault(require("oas3-chow-chow"));
let EsOpenApiVerifyMiddleware = /** @class */ (() => {
    class EsOpenApiVerifyMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, nextMiddleware) {
            // Verifica values contra o esquema.
            this.values = {};
            this.values['after'] = values['after'];
            this.next = nextMiddleware;
            const oas = lodash_1.default.get(values, 'oas', {});
            swagger_parser_1.default.validate(oas)
                .then(api => {
                const openapiVersion = lodash_1.default.get(api, 'openapi', '');
                if (lodash_1.default.toString(openapiVersion).startsWith('3.')) {
                    this.oasValidator = new oas3_chow_chow_1.default(api);
                }
            })
                .catch(err => {
                logger_1.logger.error('Error validating OpenAPI Spec', err);
            });
        }
        runIntenal(context) {
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
        execute(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const rAfter = Boolean(this.values['after']);
                if (!rAfter) {
                    yield this.runIntenal(context);
                }
                yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                if (rAfter) {
                    yield this.runIntenal(context);
                }
            });
        }
    }
    EsOpenApiVerifyMiddleware.isInOut = true;
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
        "after",
        "oas"
    ],
    "properties": {
        "after": {
            "type": "boolean"
        },
        "oas": {
            "type": "object"
        }
    }
};
//# sourceMappingURL=openapiverify-middleware.js.map