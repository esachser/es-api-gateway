import Knex from 'knex';
import _ from 'lodash';
import { EsAuthenticator, IEsAuthenticatorConstructor } from "../core/authenticators";
import { EsAuthenticatorError } from '../core/errors';
import { getDatabaseConnection } from '../util/dbKnex';
import { logger } from '../util/logger';

export class EsBasicAuthenticator extends EsAuthenticator {

    private _db: Knex;
    private _findQuery: string;
    private _roleQuery: string;
    private _userColumn: string;
    private _roleColumn: string;

    constructor(name: string, id: string, params: any) {
        super(name, id);

        this._findQuery = String(_.get(params, 'findQuery'));
        this._roleQuery = String(_.get(params, 'roleQuery'));
        this._userColumn = String(_.get(params, 'userColumn'));
        this._roleColumn = String(_.get(params, 'roleColumn'));
        
        const dbId = String(_.get(params, 'dbId'));
        this._db = getDatabaseConnection(dbId);

        if (this._db === undefined) {
            throw new EsAuthenticatorError(EsBasicAuthenticator.name, `Database with id ${dbId} not found`);
        }
    }

    async loadAsync() { }

    protected async verify(tokenStr: string) {
        // Procura no db
        const credentials = Buffer.from(tokenStr).toString('base64').split(':');

        const search = await this._db.raw(this._findQuery, credentials).then(r => r);
        const user = search[0][0];

        if (user === undefined || user === null) {
            throw new EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'Invalid credentials provided', 401);
        }

        return user;
    }

    async validate(params: any) {
        const token = _.get(params, 'token');
        const roleNeeded = _.get(params, 'role');

        const res = await this.verify(token);

        // Se os escopos
        if (roleNeeded !== undefined) {
            const rolesQuery = await this._db.raw(this._roleQuery, [_.get(res, this._userColumn)]).then(r => r);
            const roles = rolesQuery[0].map((r: any) => r[this._roleColumn]);
            if (roles === undefined || roles === null || roles.length === 0 || !roles.includes(roleNeeded)) {
                throw new EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'User has no needed role', 401);
            }
            res.roles = roles;
        }

        return res;
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
