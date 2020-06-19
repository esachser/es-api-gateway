import _ from 'lodash';
import JwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsAuthenticatorError } from '../core/errors';
import { EsOAuth2Authenticator } from './oauth2-authenticator';

export class EsOAuth2JwtAuthenticator extends EsOAuth2Authenticator {
    
    private _issuer: string
    private _audience?: string
    private _jwksClient: JwksClient.JwksClient

    constructor(name: string, id: string, params: any) {
        super(name, id, _.get(params, 'scopesScript', 'scopes=tokenObj?.scope?.split(" ");'));

        const jwksUri = String(_.get(params, 'jwksUri'));
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

    protected verify(jwtStr: string) {
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
