import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { getAuthenticator } from '../core/authenticators';

export class EsAuthenticateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsAuthenticateMiddleware';
    static readonly meta = { middleware: EsAuthenticateMiddleware.middlewareName };

    private _propToken: string;
    private _propScope: string;
    private _tokenType: string;
    private _authenticatorId: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);
        
        this._propToken = _.get(values, 'propToken', 'auth');
        this._propScope = _.get(values, 'propScope', 'scope');
        this._tokenType = _.get(values, 'tokenType', 'bearer');
        const aid = _.get(values, 'authenticatorId');
        if (_.isString(aid)) {
            this._authenticatorId = aid;
        }
        else {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, 'AuthenticatorID MUST be string');
        }

        if (getAuthenticator(aid) === undefined) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authenticator ${aid} not exists`);
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const tokenStr = _.get(context.properties, this._propToken);
        let scope = _.get(context.properties, this._propScope);

        if (!_.isString(tokenStr)) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Key Error`, undefined, 'Invalid token provided', 401);
        }

        if (scope !== undefined) {
            if (!_.isArray(scope)) {
                throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: scope MUST be an array`);
            }
    
            if (!scope.every(sc => _.isString(sc))) {
                throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: every scope MUST be string`);
            }

            scope = scope.filter(s => s.length > 0);
        }        

        const splited = tokenStr.split(' ');
        if (splited.length !== 2) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong number of token parts: ${splited.length}`);
        }
        if (_.lowerCase(splited[0]) !== this._tokenType) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong token type`);
        }

        const authenticator = getAuthenticator(this._authenticatorId);
        
        const info = await authenticator?.validate({token:splited[1], scope});

        if (!Boolean(info)) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Invalid token`);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsAuthenticateMiddleware;

export const MiddlewareSchema = {
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
