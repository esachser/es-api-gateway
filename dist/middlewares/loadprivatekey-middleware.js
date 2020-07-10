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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsLoadPrivateKeyMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const certs_1 = require("../util/certs");
let EsLoadPrivateKeyMiddleware = /** @class */ (() => {
    class EsLoadPrivateKeyMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._keyFile = lodash_1.default.get(values, 'keyFile', 'server.key');
            this._keyPassProp = lodash_1.default.get(values, 'keyPassProp', 'keypass');
            this._destProp = lodash_1.default.get(values, 'destProp', 'privateKey');
            if (!lodash_1.default.isString(this._keyFile)) {
                throw new errors_1.EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'keyFile MUST be String');
            }
            if (!lodash_1.default.isString(this._keyPassProp)) {
                throw new errors_1.EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'keyPassProp MUST be String');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'destProp MUST be String');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const pass = lodash_1.default.get(context.properties, this._keyPassProp);
                if (!lodash_1.default.isString(pass) && !lodash_1.default.isUndefined(pass)) {
                    throw new errors_1.EsMiddlewareError(EsLoadPrivateKeyMiddleware.name, 'The key password MUST be string or undefined');
                }
                const clientKey = yield certs_1.getPrivateKey(context.meta.api, this._keyFile, pass);
                lodash_1.default.set(context.properties, this._destProp, clientKey);
            });
        }
    }
    EsLoadPrivateKeyMiddleware.isInOut = true;
    EsLoadPrivateKeyMiddleware.middlewareName = 'EsLoadPrivateKeyMiddleware';
    EsLoadPrivateKeyMiddleware.meta = { middleware: EsLoadPrivateKeyMiddleware.middlewareName };
    return EsLoadPrivateKeyMiddleware;
})();
exports.EsLoadPrivateKeyMiddleware = EsLoadPrivateKeyMiddleware;
;
exports.MiddlewareCtor = EsLoadPrivateKeyMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsLoadPrivateKeyMiddleware",
    "title": "LoadPrivateKey Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyFile",
        "keyPassProp"
    ],
    "properties": {
        "keyFile": {
            "type": "string",
            "minLength": 1
        },
        "keyPassProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=loadprivatekey-middleware.js.map