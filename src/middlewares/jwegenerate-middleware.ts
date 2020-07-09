import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { JWE, JWK } from 'jose';

export class EsJweGenerateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsJweGenerateMiddleware';
    static readonly meta = { middleware: EsJweGenerateMiddleware.middlewareName };

    private _payloadProp: string;
    private _keyProp: string;
    private _algProp: string;
    private _encProp: string;
    private _useProp?: string;
    private _othOptsProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._payloadProp = _.get(values, 'payloadProp', 'jwsPayload');
        this._keyProp = _.get(values, 'keyProp', 'jweKey');
        this._algProp = _.get(values, 'algProp', 'jweAlg');
        this._encProp = _.get(values, 'encProp', 'jweEnc');
        this._useProp = _.get(values, 'useProp');
        this._destProp = _.get(values, 'destProp', 'jweGenerated');
        this._othOptsProp = _.get(values, 'othOptsProp');


        if (!_.isString(this._payloadProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'payloadProp MUST be String');
        }
        if (!_.isString(this._keyProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'keyProp MUST be String');
        }
        if (!_.isString(this._algProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'algProp MUST be String');
        }
        if (!_.isUndefined(this._useProp) && !_.isString(this._useProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'useProp MUST be String');
        }
        if (!_.isUndefined(this._othOptsProp) && !_.isString(this._othOptsProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'othOptsProp MUST be String');
        }
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'destProp MUST be String');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const payload = _.get(context.properties, this._payloadProp);
        const key = _.get(context.properties, this._keyProp);
        if (!_.isString(key) && !_.isObjectLike(key)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'key MUST be string or object');
        }
        const alg = _.get(context.properties, this._algProp);
        if (!_.isUndefined(alg) && !_.isString(alg)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'alg MUST be string');
        }
        const enc = _.get(context.properties, this._encProp);
        if (!_.isUndefined(enc) && !_.isString(enc)) {
            throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'enc MUST be string');
        }
        let opts:any = { alg, enc };
        if (!_.isUndefined(this._useProp)) {
            const use = _.get(context.properties, this._useProp);
            if (!_.isUndefined(use) && !_.isString(use)) {
                throw new EsMiddlewareError(EsJweGenerateMiddleware.name, 'use MUST be string');
            }
            opts.use = use;
        }
        if (!_.isUndefined(this._othOptsProp)) {
            const othOpts = _.get(context.properties, this._othOptsProp);
            if (_.isObjectLike(othOpts)) {
                opts = _.merge({}, othOpts, opts);
            }
        }
        const jweKey = JWK.asKey(key);
        const jweStr = JWE.encrypt(payload, jweKey, opts);
        _.set(context.properties, this._destProp, jweStr);
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsJweGenerateMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsJweGenerateMiddleware",
    "title": "JweGenerate Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "keyProp",
        "algProp"
    ],
    "properties": {
        "payloadProp": {
            "type": "string",
            "minLength": 1
        },
        "keyProp": {
            "type": "string",
            "minLength": 1
        },
        "algProp": {
            "type": "string",
            "minLength": 1
        },
        "encProp": {
            "type": "string",
            "minLength": 1
        },
        "useProp": {
            "type": "string",
            "minLength": 1
        },
        "othOptsProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
