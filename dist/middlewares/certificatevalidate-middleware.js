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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsCertificateValidateMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const node_forge_1 = __importDefault(require("node-forge"));
let EsCertificateValidateMiddleware = /** @class */ (() => {
    class EsCertificateValidateMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._certProp = lodash_1.default.get(values, 'certProp', 'request.clientCertificate');
            if (!lodash_1.default.isString(this._certProp)) {
                throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, 'certProp MUST be string');
            }
            this._caStoreProp = lodash_1.default.get(values, 'caStoreProp', 'castore');
            if (!lodash_1.default.isString(this._caStoreProp)) {
                throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, 'caStoreProp MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const certificate = lodash_1.default.get(context.properties, this._certProp);
                if (!lodash_1.default.isString(certificate)) {
                    throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, `Cerficate (prop ${this._certProp}) MUST be string`);
                }
                const caStoreStr = lodash_1.default.get(context.properties, this._caStoreProp);
                if (!lodash_1.default.isString(caStoreStr)) {
                    throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, `CAStore (prop ${this._caStoreProp}) MUST be string`);
                }
                try {
                    const cert = node_forge_1.default.pki.certificateFromPem(certificate);
                    const caStore = node_forge_1.default.pki.createCaStore([caStoreStr]);
                    const valid = yield node_forge_1.default.pki.verifyCertificateChain(caStore, [cert]);
                    if (!valid) {
                        throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, `Error verfifying certificate`, undefined, undefined, 403);
                    }
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(EsCertificateValidateMiddleware.name, `Error verfifying certificate`, err);
                }
            });
        }
    }
    EsCertificateValidateMiddleware.isInOut = true;
    EsCertificateValidateMiddleware.middlewareName = 'EsCertificateValidateMiddleware';
    EsCertificateValidateMiddleware.meta = { middleware: EsCertificateValidateMiddleware.middlewareName };
    return EsCertificateValidateMiddleware;
})();
exports.EsCertificateValidateMiddleware = EsCertificateValidateMiddleware;
exports.MiddlewareCtor = EsCertificateValidateMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsCertificateValidateMiddleware",
    "title": "CertificateValidate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "caStoreProp"
    ],
    "properties": {
        "certProp": {
            "type": "string",
            "minLength": 1
        },
        "caStoreProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=certificatevalidate-middleware.js.map