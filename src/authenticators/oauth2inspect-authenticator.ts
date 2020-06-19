import _ from 'lodash';
import { IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsAuthenticatorError } from '../core/errors';
import { EsOAuth2Authenticator } from './oauth2-authenticator';
import got from 'got';
import Keyv from 'keyv';
import { nanoid } from 'nanoid';

export class EsOAuth2InspectAuthenticator extends EsOAuth2Authenticator {

    private _issuer?: string
    private _audience?: string
    private _inspectUri: string
    private _credentialHeader: string
    private _credentialValue: string
    private _cache: Keyv

    constructor(name: string, id: string, params: any) {
        super(name, id, 'scopes=tokenObj?.scope?.split(" ");');

        this._inspectUri = String(_.get(params, 'inspectUri'));
        this._credentialHeader = String(_.get(params, 'credHeader'));
        this._credentialValue = String(_.get(params, 'credValue'));
        this._issuer = String(_.get(params, 'issuer'));
        this._audience = _.get(params, 'audience');
        this._cache = new Keyv('redis://localhost:6379', {
            maxSize: 100,
            ttl: 10*60*1000,
            namespace: `gotcache:auth2inspect:${id}`
        });
    }

    async loadAsync() { }

    protected async verify(tokenStr: string) {
        let token = await this._cache.get(tokenStr);

        if (token === undefined) {
            token = await got(this._inspectUri, {
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
            throw new EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
        }

        const active = _.get(token, 'active', false);
        if (!Boolean(active)) {
            throw new EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
        }

        if (this._issuer !== undefined) {
            const issuer = _.get(token, 'iss');
            if (this._issuer !== issuer) {
                throw new EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
            }
        }

        if (this._audience !== undefined) {
            const audience = _.get(token, 'aud');
            if (this._audience !== audience) {
                throw new EsAuthenticatorError(EsOAuth2InspectAuthenticator.name, 'Key error', undefined, 'Invalid token provided', 401);
            }
        }

        return token;
    }
}

export const AuthenticatorContructor: IEsAuthenticatorConstructor = EsOAuth2InspectAuthenticator;

export const AuthenticatorSchema = {
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
