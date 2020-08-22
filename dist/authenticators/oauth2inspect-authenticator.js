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
exports.AuthenticatorSchema = exports.AuthenticatorContructor = exports.EsOAuth2InspectAuthenticator = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const oauth2_authenticator_1 = require("./oauth2-authenticator");
const got_1 = __importDefault(require("got"));
const keyv_1 = __importDefault(require("keyv"));
const logger_1 = require("../util/logger");
class EsOAuth2InspectAuthenticator extends oauth2_authenticator_1.EsOAuth2Authenticator {
    constructor(name, id, params) {
        super(name, id, 'scopes=tokenObj?.scope?.split(" ");');
        this._inspectUri = String(lodash_1.default.get(params, 'inspectUri'));
        this._credentialHeader = String(lodash_1.default.get(params, 'credHeader'));
        this._credentialValue = String(lodash_1.default.get(params, 'credValue'));
        this._issuer = String(lodash_1.default.get(params, 'issuer'));
        this._audience = lodash_1.default.get(params, 'audience');
        this._cache = new keyv_1.default({
            maxSize: 100,
            ttl: 10 * 60 * 1000,
            namespace: `gotcache:auth2inspect:${id}`
        });
        this._cache.on('error', err => {
            logger_1.logger.error('Error loading Redis Cache', err);
        });
    }
    loadAsync() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    verify(tokenStr) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = yield this._cache.get(tokenStr);
            if (token === undefined) {
                token = yield got_1.default(this._inspectUri, {
                    headers: {
                        [this._credentialHeader]: this._credentialValue
                    },
                    form: {
                        token: tokenStr
                    },
                    method: 'POST'
                }).json();
                this._cache.set(tokenStr, token);
            }
            if (token === undefined) {
                throw new errors_1.EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
            }
            const active = lodash_1.default.get(token, 'active', false);
            if (!Boolean(active)) {
                throw new errors_1.EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
            }
            if (this._issuer !== undefined) {
                const issuer = lodash_1.default.get(token, 'iss');
                if (this._issuer !== issuer) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
                }
            }
            if (this._audience !== undefined) {
                const audience = lodash_1.default.get(token, 'aud');
                if (this._audience !== audience) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
                }
            }
            return token;
        });
    }
}
exports.EsOAuth2InspectAuthenticator = EsOAuth2InspectAuthenticator;
exports.AuthenticatorContructor = EsOAuth2InspectAuthenticator;
exports.AuthenticatorSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsOAuth2InspectAuthenticator",
    "title": "OAuth2 Inspect Authenticator parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "inspectUri",
        "credHeader",
        "credValue"
    ],
    "properties": {
        "inspectUri": {
            "type": "string",
            "format": "uri"
        },
        "credHeader": {
            "type": "string",
            "minLength": 1
        },
        "credValue": {
            "type": "string",
            "minLength": 1
        },
        "issuer": {
            "type": "string",
            "minLength": 1
        },
        "audience": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=oauth2inspect-authenticator.js.map