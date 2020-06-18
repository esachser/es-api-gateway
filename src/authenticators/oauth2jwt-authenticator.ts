import _ from 'lodash';
import JwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsAuthenticatorError } from '../core/errors';

export class EsOAuth2JwtAuthenticator extends EsAuthenticator {

    private _scopesProp: string
    private _issuer: string
    private _audience?: string
    private _jwksClient: JwksClient.JwksClient

    constructor(name: string, id: string, params: any) {
        super(name, id);

        const jwksUri = String(_.get(params, 'jwksUri'));
        this._scopesProp = String(_.get(params, 'scopesProp', 'scope'));
        this._issuer = String(_.get(params, 'issuer'));
        this._audience = _.get(params, 'audience');

        this._jwksClient = JwksClient({
            jwksUri: jwksUri,
            timeout: 5000, // Defaults to 30s
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
        });
    }

    async loadAsync() { }

    private getKey(header: any, callback: any) {
        try{
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

    private verify(jwtStr: string) {
        return new Promise<any>((resolve, reject) => {
            jwt.verify(jwtStr, this.getKey.bind(this), {
                algorithms: ['RS256'],
                issuer: this._issuer,
                audience: this._audience
            }, (err, res) => {
                if (err) {
                    return reject(new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'Key error', err, 'Invalid token provided', 401));
                }
                return resolve(res);
            });
        });
    }

    async validate(params: any) {
        const token = _.get(params, 'token');
        const scopesNeeded = _.get(params, 'scope');

        const res = await this.verify(token);
        const scopesHadStr = _.get(res, this._scopesProp);
        
        // Se os escopos
        if (scopesNeeded !== undefined) {
            if (scopesHadStr === undefined) {
                throw new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }

            if (!_.isArray(scopesNeeded)) {
                throw new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'scopes MUST be array');
            }

            if (!_.isString(scopesHadStr)) {
                throw new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'scopes are not string');
            }

            const scopesHad = scopesHadStr.split(' ');

            if (scopesHad.length < scopesNeeded.length) {
                throw new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }

            const containScopes = scopesNeeded.every(scope => scopesHad.includes(scope));

            if (!containScopes) {
                throw new EsAuthenticatorError(EsOAuth2JwtAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }
        }

        return res;
    }
}

export const AuthenticatorContructor: IEsAuthenticatorConstructor = EsOAuth2JwtAuthenticator;

export const AuthenticatorSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsOAuth2JwtAuthenticator",
    "title": "OAuth2 JWT Authenticator parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "jwksUri",
        "scopesProp",
        "issuer"
    ],
    "properties": {
        "jwksUri": {
            "type": "string",
            "format": "uri"
        },
        "scopesProp": {
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
