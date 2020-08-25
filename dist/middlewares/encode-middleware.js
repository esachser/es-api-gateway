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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsEncodeMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const content_type_1 = __importDefault(require("content-type"));
const parsers_1 = __importDefault(require("../core/parsers"));
const middlewares_1 = require("../core/middlewares");
let EsEncodeMiddleware = /** @class */ (() => {
    class EsEncodeMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._sourceProp = lodash_1.default.get(values, 'sourceProp', 'parsedBody');
            this._destProp = lodash_1.default.get(values, 'destProp', 'response.body');
            this._contentType = lodash_1.default.get(values, 'contentType', 'response.headers.content-type');
            if (!lodash_1.default.isString(this._sourceProp)) {
                throw new errors_1.EsMiddlewareError(EsEncodeMiddleware.name, 'sourceProp MUST be String');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsEncodeMiddleware.name, 'destProp MUST be String');
            }
            if (!lodash_1.default.isString(this._contentType)) {
                throw new errors_1.EsMiddlewareError(EsEncodeMiddleware.name, 'contentType MUST be String');
            }
            this._parserOpts = lodash_1.default.get(values, 'parserOpts');
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const body = lodash_1.default.get(context.properties, this._sourceProp);
                const cTypeStr = lodash_1.default.get(context.properties, this._contentType);
                // Só faz algo se
                // body é buffer
                // cType é String
                if (lodash_1.default.isString(cTypeStr)) {
                    const cType = content_type_1.default.parse(cTypeStr);
                    const res = yield parsers_1.default.transform(body, {
                        atb: {
                            parser: 'EsMediaType',
                            opts: Object.assign(Object.assign({}, this._parserOpts), { mediaType: cType === null || cType === void 0 ? void 0 : cType.type, encoding: (_a = cType === null || cType === void 0 ? void 0 : cType.parameters) === null || _a === void 0 ? void 0 : _a.charset })
                        }
                    });
                    lodash_1.default.set(context.properties, this._destProp, res);
                }
            });
        }
    }
    EsEncodeMiddleware.isInOut = true;
    EsEncodeMiddleware.middlewareName = 'EsEncodeMiddleware';
    EsEncodeMiddleware.meta = { middleware: EsEncodeMiddleware.middlewareName };
    return EsEncodeMiddleware;
})();
exports.EsEncodeMiddleware = EsEncodeMiddleware;
;
exports.MiddlewareCtor = EsEncodeMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsEncodeMiddleware",
    "title": "Encode Middleware",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        },
        "contentType": {
            "type": "string",
            "minLength": 1
        },
        "parserOpts": {
            "type": "object"
        }
    }
};
//# sourceMappingURL=encode-middleware.js.map