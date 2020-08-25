import _ from 'lodash';
import getRawBody from 'raw-body';
import isStream from 'is-stream';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';

export class EsGetRawBodyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsGetRawBodyMiddleware';
    static readonly meta = { middleware: EsGetRawBodyMiddleware.middlewareName };
    static readonly DEFAULT_MAXLEN = 10 * 1024;

    private _streamProp: string;
    private _maxLenProp?: string;
    private _destProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._streamProp = _.get(values, 'streamProp');
        if (!_.isString(this._streamProp)) {
            throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'streamProp MUST be string');
        }

        this._maxLenProp = _.get(values, 'maxLenProp');
        if (!_.isUndefined(this._maxLenProp) && !_.isString(this._maxLenProp)) {
            throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'maxLenProp MUST be string');
        }

        this._destProp = _.get(values, 'destProp', 'request.body');
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'destProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const stream = _.get(context.properties, this._streamProp);
        if (!isStream.readable(stream)) {
            throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Not a stream readable');
        }

        const maxLen = this._maxLenProp !== undefined ? _.get(context.properties, this._maxLenProp, EsGetRawBodyMiddleware.DEFAULT_MAXLEN) : EsGetRawBodyMiddleware.DEFAULT_MAXLEN;
        if (!_.isNumber(maxLen) || maxLen <= 0) {
            throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'maxLen MUST be a number greater than 0');
        }

        try {
            if (stream.readableLength > 0) {
                const rawBody = await getRawBody(stream, {
                    limit: maxLen
                });
                _.set(context.properties, this._destProp, rawBody);
            }
        }
        catch (err) {
            if (Boolean(err.expose)) {
                throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Error in payload', err, err.message, err.status ?? 400);
            }
            else {
                throw new EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Error in payload', err);
            }
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsGetRawBodyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetRawBodyMiddleware",
    "title": "GetRawBody Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "streamProp",
    ],
    "properties": {
        "streamProp": {
            "type": "string",
            "minLength": 1
        },
        "maxLenProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
