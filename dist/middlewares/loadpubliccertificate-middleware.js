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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsLoadPublicCerficateMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const certs_1 = require("../util/certs");
let EsLoadPublicCerficateMiddleware = /** @class */ (() => {
    class EsLoadPublicCerficateMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._certFile = lodash_1.default.get(values, 'certFile', 'server.crt');
            this._destProp = lodash_1.default.get(values, 'destProp', 'publicCert');
            if (!lodash_1.default.isString(this._certFile)) {
                throw new errors_1.EsMiddlewareError(EsLoadPublicCerficateMiddleware.name, 'keyFile MUST be String');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsLoadPublicCerficateMiddleware.name, 'destProp MUST be String');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const cert = yield certs_1.getPublicCert(context.meta.api, this._certFile);
                lodash_1.default.set(context.properties, this._destProp, cert);
            });
        }
    }
    EsLoadPublicCerficateMiddleware.isInOut = true;
    EsLoadPublicCerficateMiddleware.middlewareName = 'EsLoadPublicCerficateMiddleware';
    EsLoadPublicCerficateMiddleware.meta = { middleware: EsLoadPublicCerficateMiddleware.middlewareName };
    return EsLoadPublicCerficateMiddleware;
})();
exports.EsLoadPublicCerficateMiddleware = EsLoadPublicCerficateMiddleware;
;
exports.MiddlewareCtor = EsLoadPublicCerficateMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsLoadPublicCerficateMiddleware",
    "title": "LoadPublicCerficate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "certFile",
    ],
    "properties": {
        "certFile": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=loadpubliccertificate-middleware.js.map