import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import SwaggerParser from '@apidevtools/swagger-parser';
import ChowChow from "oas3-chow-chow";
import { EsMiddlewareError } from '../core/errors';

export class EsOpenApiVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsOpenApiVerifyMiddleware';
    static readonly meta = { middleware: EsOpenApiVerifyMiddleware.middlewareName };

    private _oasValidator?: ChowChow;
    private _propResult?: string;
    private _throw?: boolean;
    private _propMethod: string = '';
    private _propUrl: string = '';
    private _propBody: string = '';
    private _propHeaders: string = '';
    private _propQuery: string = '';
    private _propParams: string = '';
    
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
    }

    async loadAsync(values: any) {
        const oas = _.get(values, 'oas', {});
        try{
            const api = await SwaggerParser.validate(oas);
            const openapiVersion = _.get(api, 'openapi', '');

            if (_.toString(openapiVersion).startsWith('3.')) {
                this._oasValidator = new ChowChow(api as any);
                this._propResult = _.get(values, 'propResult');
                this._throw = _.get(values, 'throw');
                this._propMethod = _.get(values, 'method', 'request.method');
                this._propUrl = _.get(values, 'url', 'request.path');
                this._propBody = _.get(values, 'body', 'request.parsedBody');
                this._propHeaders = _.get(values, 'headers', 'request.headers');
                this._propQuery = _.get(values, 'query', 'request.query');
                this._propParams = _.get(values, 'params', 'request.params');
            }
            else {
                throw new EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'The OpenAPI version MUST be 3.x.x');
            }
        }
        catch(err) {
            throw new EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'Error creating OpenAPI validator', err);
        }
    }

    async runInternal(context: IEsContext) {
        if (this._oasValidator !== undefined) {
            const method = _.get(context.properties, this._propMethod);
            let path = _.get(context.properties, this._propUrl, '');
            const body = _.get(context.properties, this._propBody, {});
            const headers = _.get(context.properties, this._propHeaders);
            const query = _.get(context.properties, this._propQuery, {});
            const params = _.get(context.properties, this._propParams, {});

            if (!path.startsWith('/')) {
                path = `/${path}`;
            }

            try {
                // Fazer parsing do body para JSON, mesmo que venha XML ou outra coisa.
                
                const reqMeta = this._oasValidator.validateRequestByPath(path, method, { body, path: params, header: headers, query });
                context.logger.debug('OAS Validator result', _.merge({}, reqMeta, EsOpenApiVerifyMiddleware.meta, context.meta));
                if (this._propResult !== undefined) {
                    _.set(context.properties, this._propResult, reqMeta);
                }
            }
            catch (err) {
                if (this._propResult !== undefined) {
                    _.set(context.properties, this._propResult, undefined);
                }
                if (Boolean(this._throw)) {
                    throw new EsMiddlewareError(EsOpenApiVerifyMiddleware.middlewareName, 'Error verifying OpenAPI Request', {message: err.message, name: err.name, stack:err.stack});
                }
                else {
                    context.logger.error('Error verifying OpenAPI Request', _.merge({}, err, EsOpenApiVerifyMiddleware.meta));
                }
            }
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsOpenApiVerifyMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsOpenApiVerifyMiddleware",
    "title": "OpenApiVerify Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "oas",
        "throw"
    ],
    "properties": {
        "oas": {
            "type": "object"
        },
        "throw": {
            "type": "boolean"
        },
        "propResult": {
            "type": "string"
        },
        "method": {
            "type": "string"
        },
        "url": {
            "type": "string"
        },
        "body": {
            "type": "string"
        },
        "headers": {
            "type": "string"
        },
        "query": {
            "type": "string"
        },
        "params": {
            "type": "string"
        }
    }
};
