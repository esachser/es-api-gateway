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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsJwsVerifyMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const jose_1 = require("jose");
const middlewares_1 = require("../core/middlewares");
let EsJwsVerifyMiddleware = /** @class */ (() => {
    class EsJwsVerifyMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._payloadProp = lodash_1.default.get(values, 'payloadProp', 'jwsGenerated');
            this._keyProp = lodash_1.default.get(values, 'keyProp', 'jwsKey');
            this._algProp = lodash_1.default.get(values, 'algProp', 'jwsAlg');
            this._useProp = lodash_1.default.get(values, 'useProp');
            this._destProp = lodash_1.default.get(values, 'destProp', 'jwsVerified');
            this._othOptsProp = lodash_1.default.get(values, 'othOptsProp');
            this._verifyOptsProp = lodash_1.default.get(values, 'verifyOptsProp');
            if (!lodash_1.default.isString(this._payloadProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'payloadProp MUST be String');
            }
            if (!lodash_1.default.isString(this._keyProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'keyProp MUST be String');
            }
            if (!lodash_1.default.isString(this._algProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'algProp MUST be String');
            }
            if (!lodash_1.default.isUndefined(this._useProp) && !lodash_1.default.isString(this._useProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'useProp MUST be String');
            }
            if (!lodash_1.default.isUndefined(this._othOptsProp) && !lodash_1.default.isString(this._othOptsProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'othOptsProp MUST be String');
            }
            if (!lodash_1.default.isUndefined(this._verifyOptsProp) && !lodash_1.default.isString(this._verifyOptsProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'verifyOptsProp MUST be String');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'destProp MUST be String');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const payload = lodash_1.default.get(context.properties, this._payloadProp);
                const key = lodash_1.default.get(context.properties, this._keyProp, jose_1.JWK.None);
                if (!lodash_1.default.isString(key) && !lodash_1.default.isObjectLike(key)) {
                    throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'key MUST be string or object');
                }
                const alg = lodash_1.default.get(context.properties, this._algProp);
                if (key !== jose_1.JWK.None && !lodash_1.default.isString(alg)) {
                    throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'alg MUST be string');
                }
                let opts = { alg };
                if (!lodash_1.default.isUndefined(this._useProp)) {
                    const use = lodash_1.default.get(context.properties, this._useProp);
                    if (!lodash_1.default.isUndefined(use) && !lodash_1.default.isString(use)) {
                        throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'use MUST be string');
                    }
                    opts.use = use;
                }
                if (!lodash_1.default.isUndefined(this._othOptsProp)) {
                    const othOpts = lodash_1.default.get(context.properties, this._othOptsProp);
                    if (lodash_1.default.isObjectLike(othOpts)) {
                        opts = lodash_1.default.merge({}, othOpts, opts);
                    }
                }
                const jwk = key === jose_1.JWK.None ? key : jose_1.JWK.asKey(key, opts);
                let verifyOpts = {
                    algorithms: ['HS256']
                };
                if (!lodash_1.default.isUndefined(this._verifyOptsProp)) {
                    const vOpts = lodash_1.default.get(context.properties, this._verifyOptsProp, {});
                    if (lodash_1.default.isObjectLike(vOpts)) {
                        lodash_1.default.merge(verifyOpts, vOpts);
                    }
                }
                try {
                    const res = jose_1.JWS.verify(payload, jwk, verifyOpts);
                    lodash_1.default.set(context.properties, this._destProp, res);
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(EsJwsVerifyMiddleware.name, 'Error verifying JWS', err);
                }
            });
        }
    }
    EsJwsVerifyMiddleware.isInOut = true;
    EsJwsVerifyMiddleware.middlewareName = 'EsJwsVerifyMiddleware';
    EsJwsVerifyMiddleware.meta = { middleware: EsJwsVerifyMiddleware.middlewareName };
    return EsJwsVerifyMiddleware;
})();
exports.EsJwsVerifyMiddleware = EsJwsVerifyMiddleware;
;
exports.MiddlewareCtor = EsJwsVerifyMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJwsVerifyMiddleware",
    "title": "JwsVerify Middleware",
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
        },
        "verifyOptsProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=jwsverify-middleware.js.map