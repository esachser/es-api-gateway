import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { getResourceFileStream, getResourceStat } from '../util/resources';

export class EsGetResourceMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsGetResourceMiddleware';
    static readonly meta = { middleware: EsGetResourceMiddleware.middlewareName };

    private readonly _resourceProp: string;
    private readonly _destProp: string;
    private readonly _destStatProp: string;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._resourceProp = _.get(values, 'resourceProp');
        if (!_.isString(this._resourceProp)) {
            throw new EsMiddlewareError(EsGetResourceMiddleware.name, 'resourceProp MUST be string');
        }

        this._destProp = _.get(values, 'destProp', 'response.body');
        if (!_.isString(this._destProp)) {
            throw new EsMiddlewareError(EsGetResourceMiddleware.name, 'destProp MUST be string');
        }

        this._destStatProp = _.get(values, 'destStatProp', 'resource.stat');
        if (!_.isString(this._destStatProp)) {
            throw new EsMiddlewareError(EsGetResourceMiddleware.name, 'destStatProp MUST be string');
        }
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const resourceStr = _.get(context.properties, this._resourceProp);

        if (!_.isString(resourceStr)) {
            throw new EsMiddlewareError(EsGetResourceMiddleware.name, `The resource filename (prop ${this._resourceProp}) MUST be string`);
        }

        try {
            const stat = await getResourceStat(resourceStr, context.meta.api);
            const resource = await getResourceFileStream(resourceStr, context.meta.api);
            _.set(context.properties, this._destProp, resource);
            _.set(context.properties, this._destStatProp, stat);
        }
        catch (err) {
            throw new EsMiddlewareError(EsGetResourceMiddleware.name, 'Not Found', err, 'The resource has not been found', 404);
        }
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsGetResourceMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetResourceMiddleware",
    "title": "GetResource Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "resourceProp"
    ],
    "properties": {
        "resourceProp": {
            "type": "string"
        },
        "destProp": {
            "type": "string"
        },
        "destStatProp": {
            "type": "string"
        }
    }
};
