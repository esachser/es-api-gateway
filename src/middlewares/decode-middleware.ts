import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import contentType from 'content-type';
import parsers from '../core/parsers';

export class EsDecodeMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsDecodeMiddleware';
    static readonly meta = { middleware: EsDecodeMiddleware.middlewareName };

    private readonly _sourceProp: string;
    private readonly _destProp: string;
    private readonly _contentType: string;
    private readonly _parserOpts: any;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);

        this._sourceProp = _.get(values, 'sourceProp', 'request.body');
        this._destProp = _.get(values, 'destProp', 'parsedBody');
        this._contentType = _.get(values, 'contentType', 'request.headers.content-type');

        if (!_.isString(this._sourceProp)) {
            throw new EsMiddlewareError(EsDecodeMiddleware.name, 'sourceProp MUST be String')
        }

        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsDecodeMiddleware.name, 'destProp MUST be String')
        }

        if (!_.isString(this._contentType)) {
            throw new EsMiddlewareError(EsDecodeMiddleware.name, 'contentType MUST be String')
        }

        this._parserOpts = _.get(values, 'parserOpts');
    }

    async loadAsync() {}

    async runInternal(context: IEsContext) {
        const body = _.get(context.properties, this._sourceProp);
        const cTypeStr = _.get(context.properties, this._contentType);

        // Só faz algo se
        // body é buffer
        // cType é String
        if (_.isBuffer(body) && _.isString(cTypeStr)) {
            const cType = contentType.parse(cTypeStr);

            const res = await parsers.transform(body, {
                bta: {
                    parser: 'EsMediaType',
                    opts: {
                        ...this._parserOpts,
                        mediaType: cType?.type,
                        encoding: cType?.parameters?.charset
                    }
                }
            });

            _.set(context.properties, this._destProp, res);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsDecodeMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsDecodeMiddleware",
    "title": "Decode Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "destProp",
    ],
    "properties": {
        "sourceProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        },
        "contentType": {
            "type": "string",
            "minLength": 1
        },
        "parserOpts": {
            "type": "object"
        }
    }
};

