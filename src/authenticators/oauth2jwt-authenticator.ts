import _ from 'lodash';
import JwksClient from 'jwks-rsa';
import jose from 'jose';
import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";

export class EsOAuth2JwtAuthenticator extends EsAuthenticator {

    private _scopesProp: string
    private _jwksClient: JwksClient.JwksClient

    constructor(name: string, id: string, params: any) {
        super(name, id);

        const jwksUri = String(_.get(params, 'jwksUri'));
        this._scopesProp = String(_.get(params, 'scopesProp', 'scope'));

        this._jwksClient = JwksClient({
            jwksUri: jwksUri,
            timeout: 5000, // Defaults to 30s
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: 10 * 60 * 1000
        });
    }

    async loadAsync() { }

    async validate(params: any) {
        const token = _.get(params, 'token');
        const scopesNeeded = _.get(params, 'scope');

        return {};
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
