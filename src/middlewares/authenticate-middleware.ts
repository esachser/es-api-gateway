import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { getAuthenticator } from '../core/authenticators';

export class EsAuthenticateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsAuthenticateMiddleware';
    static readonly meta = { middleware: EsAuthenticateMiddleware.middlewareName };

    private _prop: string;
    private _tokenType: string;
    private _authenticatorId: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        
        this._prop = _.get(values, 'prop', 'auth');
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
        const value = _.get(context.properties, this._prop);

        if (!_.isString(value)) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: token MUST be a string`);
        }

        const splited = value.split(' ');
        if (splited.length !== 2) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong number of token parts: ${splited.length}`);
        }
        if (_.lowerCase(splited[0]) !== this._tokenType) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error: Wrong token type`);
        }

        const authenticator = getAuthenticator(this._authenticatorId);
        
        const info = await authenticator?.validate({token:splited[1]});

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
        "prop",
        "tokenType",
        "authenticatorId"
    ],
    "properties": {
        "prop": {
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
