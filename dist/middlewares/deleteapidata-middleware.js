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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsDeleteApiDataMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const config_1 = require("../util/config");
const etdc_1 = __importDefault(require("../util/etdc"));
let EsDeleteApiDataMiddleware = /** @class */ (() => {
    class EsDeleteApiDataMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._srcProp = lodash_1.default.get(values, 'sourceProp');
            if (!lodash_1.default.isString(this._srcProp)) {
                throw new errors_1.EsMiddlewareError(EsDeleteApiDataMiddleware.name, 'sourceProp MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const src = lodash_1.default.get(context.properties, this._srcProp);
                if (!lodash_1.default.isString(src)) {
                    throw new errors_1.EsMiddlewareError(EsDeleteApiDataMiddleware.name, `Destination (prop ${this._srcProp}) MUST be string`);
                }
                const realSrc = `esgateway/runtime/${config_1.configuration.env}/apis/${context.meta.api}/store/${src}`;
                const etcdClient = etdc_1.default();
                yield etcdClient.delete().key(realSrc);
            });
        }
    }
    EsDeleteApiDataMiddleware.isInOut = true;
    EsDeleteApiDataMiddleware.middlewareName = 'EsDeleteApiDataMiddleware';
    EsDeleteApiDataMiddleware.meta = { middleware: EsDeleteApiDataMiddleware.middlewareName };
    return EsDeleteApiDataMiddleware;
})();
exports.EsDeleteApiDataMiddleware = EsDeleteApiDataMiddleware;
exports.MiddlewareCtor = EsDeleteApiDataMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsDeleteApiDataMiddleware",
    "title": "DeleteApiData Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=deleteapidata-middleware.js.map