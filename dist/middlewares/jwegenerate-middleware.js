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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsJweGenerateMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const jose_1 = require("jose");
const middlewares_1 = require("../core/middlewares");
let EsJweGenerateMiddleware = /** @class */ (() => {
    class EsJweGenerateMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._payloadProp = lodash_1.default.get(values, 'payloadProp', 'jwsPayload');
            this._keyProp = lodash_1.default.get(values, 'keyProp', 'jweKey');
            this._algProp = lodash_1.default.get(values, 'algProp', 'jweAlg');
            this._encProp = lodash_1.default.get(values, 'encProp', 'jweEnc');
            this._useProp = lodash_1.default.get(values, 'useProp');
            this._destProp = lodash_1.default.get(values, 'destProp', 'jweGenerated');
            this._othOptsProp = lodash_1.default.get(values, 'othOptsProp');
            if (!lodash_1.default.isString(this._payloadProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'payloadProp MUST be String');
            }
            if (!lodash_1.default.isString(this._keyProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'keyProp MUST be String');
            }
            if (!lodash_1.default.isString(this._algProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'algProp MUST be String');
            }
            if (!lodash_1.default.isUndefined(this._useProp) && !lodash_1.default.isString(this._useProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'useProp MUST be String');
            }
            if (!lodash_1.default.isUndefined(this._othOptsProp) && !lodash_1.default.isString(this._othOptsProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'othOptsProp MUST be String');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'destProp MUST be String');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const payload = lodash_1.default.get(context.properties, this._payloadProp);
                const key = lodash_1.default.get(context.properties, this._keyProp);
                if (!lodash_1.default.isString(key) && !lodash_1.default.isObjectLike(key)) {
                    throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'key MUST be string or object');
                }
                const alg = lodash_1.default.get(context.properties, this._algProp);
                if (!lodash_1.default.isUndefined(alg) && !lodash_1.default.isString(alg)) {
                    throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'alg MUST be string');
                }
                const enc = lodash_1.default.get(context.properties, this._encProp);
                if (!lodash_1.default.isUndefined(enc) && !lodash_1.default.isString(enc)) {
                    throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'enc MUST be string');
                }
                let opts = { alg, enc };
                if (!lodash_1.default.isUndefined(this._useProp)) {
                    const use = lodash_1.default.get(context.properties, this._useProp);
                    if (!lodash_1.default.isUndefined(use) && !lodash_1.default.isString(use)) {
                        throw new errors_1.EsMiddlewareError(EsJweGenerateMiddleware.name, 'use MUST be string');
                    }
                    opts.use = use;
                }
                if (!lodash_1.default.isUndefined(this._othOptsProp)) {
                    const othOpts = lodash_1.default.get(context.properties, this._othOptsProp);
                    if (lodash_1.default.isObjectLike(othOpts)) {
                        opts = lodash_1.default.merge({}, othOpts, opts);
                    }
                }
                const jweKey = jose_1.JWK.asKey(key);
                const jweStr = jose_1.JWE.encrypt(payload, jweKey, opts);
                lodash_1.default.set(context.properties, this._destProp, jweStr);
            });
        }
    }
    EsJweGenerateMiddleware.isInOut = true;
    EsJweGenerateMiddleware.middlewareName = 'EsJweGenerateMiddleware';
    EsJweGenerateMiddleware.meta = { middleware: EsJweGenerateMiddleware.middlewareName };
    return EsJweGenerateMiddleware;
})();
exports.EsJweGenerateMiddleware = EsJweGenerateMiddleware;
;
exports.MiddlewareCtor = EsJweGenerateMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJweGenerateMiddleware",
    "title": "JweGenerate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyProp",
        "algProp"
    ],
    "properties": {
        "payloadProp": {
            "type": "string",
            "minLength": 1
        },
        "keyProp": {
            "type": "string",
            "minLength": 1
        },
        "algProp": {
            "type": "string",
            "minLength": 1
        },
        "encProp": {
            "type": "string",
            "minLength": 1
        },
        "useProp": {
            "type": "string",
            "minLength": 1
        },
        "othOptsProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=jwegenerate-middleware.js.map