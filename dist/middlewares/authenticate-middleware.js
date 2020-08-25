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
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const authenticators_1 = require("../core/authenticators");
const middlewares_1 = require("../core/middlewares");
let EsAuthenticateMiddleware = /** @class */ (() => {
    class EsAuthenticateMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._propToken = lodash_1.default.get(values, 'propToken', 'auth');
            this._propScope = lodash_1.default.get(values, 'propScope', 'scope');
            this._tokenType = lodash_1.default.get(values, 'tokenType', 'bearer');
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
                const tokenStr = lodash_1.default.get(context.properties, this._propToken);
                let scope = lodash_1.default.get(context.properties, this._propScope);
                if (!lodash_1.default.isString(tokenStr)) {
                    throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Key Error`, undefined, 'Invalid token provided', 401);
                }
                if (scope !== undefined) {
                    if (!lodash_1.default.isArray(scope)) {
                        throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: scope MUST be an array`);
                    }
                    if (!scope.every(sc => lodash_1.default.isString(sc))) {
                        throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: every scope MUST be string`);
                    }
                    scope = scope.filter(s => s.length > 0);
                }
                const splited = tokenStr.split(' ');
                if (splited.length !== 2) {
                    throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong number of token parts: ${splited.length}`);
                }
                if (lodash_1.default.lowerCase(splited[0]) !== this._tokenType) {
                    throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong token type`);
                }
                const authenticator = authenticators_1.getAuthenticator(this._authenticatorId);
                const info = yield (authenticator === null || authenticator === void 0 ? void 0 : authenticator.validate({ token: splited[1], scope }));
                if (!Boolean(info)) {
                    throw new errors_1.EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Invalid token`);
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
        "propToken",
        "propScope",
        "tokenType",
        "authenticatorId"
    ],
    "properties": {
        "propToken": {
            "type": "string",
            "minLength": 1
        },
        "propScope": {
            "type": "string",
            "minLength": 1
        },
        "tokenType": {
            "type": "string",
            "enum": ["basic", "bearer"]
        },
        "authenticatorId": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=authenticate-middleware.js.map