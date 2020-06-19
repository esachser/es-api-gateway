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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../core/errors");
const oauth2_authenticator_1 = require("./oauth2-authenticator");
class EsOAuth2JwtAuthenticator extends oauth2_authenticator_1.EsOAuth2Authenticator {
    constructor(name, id, params) {
        super(name, id, lodash_1.default.get(params, 'scopesScript', 'scopes=tokenObj?.scope?.split(" ");'));
        const jwksUri = String(lodash_1.default.get(params, 'jwksUri'));
        this._issuer = String(lodash_1.default.get(params, 'issuer'));
        this._audience = lodash_1.default.get(params, 'audience');
        this._jwksClient = jwks_rsa_1.default({
            jwksUri: jwksUri,
            timeout: 5000,
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
        });
    }
    loadAsync() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getKey(header, callback) {
        try {
            this._jwksClient.getSigningKey(header.kid, function (err, key) {
                if (err) {
                    callback(err, undefined);
                    return;
                }
                var signingKey = key.getPublicKey();
                callback(null, signingKey);
            });
        }
        catch (err) {
            callback(err, undefined);
        }
    }
    verify(jwtStr) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(jwtStr, this.getKey.bind(this), {
                algorithms: ['RS256'],
                issuer: this._issuer,
                audience: this._audience
            }, (err, res) => {
                if (err) {
                    return reject(new errors_1.EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'Key error', err, 'Invalid token provided', 401));
                }
                return resolve(res);
            });
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
        "scopesScript",
        "issuer"
    ],
    "properties": {
        "jwksUri": {
            "type": "string",
            "format": "uri"
        },
        "scopesScript": {
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
//# sourceMappingURL=oauth2jwt-authenticator.js.map