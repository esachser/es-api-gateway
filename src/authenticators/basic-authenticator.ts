import _ from 'lodash';
import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsAuthenticatorError } from '../core/errors';
import { getDatabaseConnection } from '../util/dbKnex';
import { logger } from '../util/logger';

export class EsBasicAuthenticator extends EsAuthenticator {

    private _dbId: string
    private _query: string

    constructor(name: string, id: string, params: any) {
        super(name, id);

        this._dbId = String(_.get(params, 'dbId'));
        this._query = String(_.get(params, 'query'));
    }

    async loadAsync() { }

    protected async verify(tokenStr: string) {
        // Procura no db
        const credentials = Buffer.from(tokenStr).toString('base64').split(':');

        const db = getDatabaseConnection(this._dbId);
        const search = await db.raw(this._query, credentials).then(r => r);

        if (search === undefined) {
            throw new EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'Invalid credentials provided', 401);
        }

        return search;
    }

    async validate(params: any) {
        const token = _.get(params, 'token');
        const scopesNeeded = _.get(params, 'scope');

        const res = await this.verify(token);
    }
}

export const AuthenticatorContructor: IEsAuthenticatorConstructor = EsBasicAuthenticator;

export const AuthenticatorSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsBasicAuthenticator",
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
