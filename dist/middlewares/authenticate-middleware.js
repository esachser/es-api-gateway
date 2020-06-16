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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsAuthenticateMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const authenticators_1 = require("../core/authenticators");
let EsAuthenticateMiddleware = /** @class */ (() => {
    class EsAuthenticateMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            this._prop = lodash_1.default.get(values, 'prop', 'auth');
            const aid = lodash_1.default.get(values, 'authenticatorId');
            if (lodash_1.default.isString(aid)) {
                this._authenticatorId = aid;
            }
            else {
                throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, 'AuthenticatorID MUST be string');
            }
            if (authenticators_1.getAuthenticator(aid) === undefined) {
                throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authenticator ${aid} not exists`);
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const value = lodash_1.default.get(context.properties, this._prop);
                const authenticator = authenticators_1.getAuthenticator(this._authenticatorId);
                const info = yield (authenticator === null || authenticator === void 0 ? void 0 : authenticator.validate(value));
                if (!Boolean(info)) {
                    throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error`);
                }
            });
        }
    }
    EsAuthenticateMiddleware.isInOut = true;
    EsAuthenticateMiddleware.middlewareName = 'EsAuthenticateMiddleware';
    EsAuthenticateMiddleware.meta = { middleware: EsAuthenticateMiddleware.middlewareName };
    return EsAuthenticateMiddleware;
})();
exports.EsAuthenticateMiddleware = EsAuthenticateMiddleware;
;
exports.MiddlewareCtor = EsAuthenticateMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsAuthenticateMiddleware",
    "title": "Authenticate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "prop",
        "authenticatorId"
    ],
    "properties": {
        "prop": {
            "type": "string",
            "minLength": 1
        },
        "authenticatorId": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=authenticate-middleware.js.map