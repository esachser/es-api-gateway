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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsGetApiDataMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const config_1 = require("../util/config");
const etdc_1 = __importDefault(require("../util/etdc"));
let EsGetApiDataMiddleware = /** @class */ (() => {
    class EsGetApiDataMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._srcProp = lodash_1.default.get(values, 'sourceProp');
            this._destProp = lodash_1.default.get(values, 'destProp');
            if (!lodash_1.default.isString(this._srcProp)) {
                throw new errors_1.EsMiddlewareError(EsGetApiDataMiddleware.name, 'sourceProp MUST be string');
            }
            if (!lodash_1.default.isUndefined(this._destProp) && !lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsGetApiDataMiddleware.name, 'destProp MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const src = lodash_1.default.get(context.properties, this._srcProp);
                if (!lodash_1.default.isString(src)) {
                    throw new errors_1.EsMiddlewareError(EsGetApiDataMiddleware.name, `Destination (prop ${this._srcProp}) MUST be string`);
                }
                const realSrc = `esgateway/runtime/${config_1.configuration.env}/apis/${context.meta.api}/store/${src}`;
                const etcdClient = etdc_1.default();
                const prop = yield etcdClient.get(realSrc);
                if (prop !== null) {
                    lodash_1.default.set(context.properties, this._destProp, prop);
                }
            });
        }
    }
    EsGetApiDataMiddleware.isInOut = true;
    EsGetApiDataMiddleware.middlewareName = 'EsGetApiDataMiddleware';
    EsGetApiDataMiddleware.meta = { middleware: EsGetApiDataMiddleware.middlewareName };
    return EsGetApiDataMiddleware;
})();
exports.EsGetApiDataMiddleware = EsGetApiDataMiddleware;
exports.MiddlewareCtor = EsGetApiDataMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetApiDataMiddleware",
    "title": "GetApiData Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp",
        "destProp"
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=getapidata-middleware.js.map