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
exports.AuthenticatorSchema = exports.AuthenticatorContructor = exports.EsOAuth2JwtAuthenticator = void 0;
const lodash_1 = __importDefault(require("lodash"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const authenticators_1 = require("../core/authenticators");
class EsOAuth2JwtAuthenticator extends authenticators_1.EsAuthenticator {
    constructor(name, id, params) {
        super(name, id);
        const jwksUri = String(lodash_1.default.get(params, 'jwksUri'));
        this._scopesProp = String(lodash_1.default.get(params, 'scopesProp', 'scope'));
        this._jwksClient = jwks_rsa_1.default({
            jwksUri: jwksUri,
            timeout: 5000,
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000
        });
    }
    loadAsync() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    validate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = lodash_1.default.get(params, 'token');
            const scopesNeeded = lodash_1.default.get(params, 'scope');
            return {};
        });
    }
}
exports.EsOAuth2JwtAuthenticator = EsOAuth2JwtAuthenticator;
exports.AuthenticatorContructor = EsOAuth2JwtAuthenticator;
exports.AuthenticatorSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsOAuth2JwtAuthenticator",
    "title": "OAuth2 JWT Authenticator parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "jwksUri",
        "scopesProp"
    ],
    "properties": {
        "jwksUri": {
            "type": "string",
            "format": "uri"
        },
        "scopesProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=oauth2jwt-authenticator.js.map