import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { getAuthenticator } from '../core/authenticators';

export class EsAuthenticateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsAuthenticateMiddleware';
    static readonly meta = { middleware: EsAuthenticateMiddleware.middlewareName };

    private _prop: string;
    private _authenticatorId: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        
        this._prop = _.get(values, 'prop', 'auth');
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
        const authenticator = getAuthenticator(this._authenticatorId);
        const info = await authenticator?.validate(value);

        if (!Boolean(info)) {
            throw new EsMiddlewareError(EsAuthenticateMiddleware.name, `Authentication error`);
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
        "authenticatorId"
    ],
    "properties": {
        "prop": {
            "type": "string",
            "minLength": 1
        },
        "authenticatorId": {
            "type": "string",
            "minLength": 1
        }
    }
};
