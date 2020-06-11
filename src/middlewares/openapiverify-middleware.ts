import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import SwaggerParser from '@apidevtools/swagger-parser';
import ChowChow from "oas3-chow-chow";

export class EsOpenApiVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;

    values: any;

    oasValidator?: ChowChow;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = {};

        const oas = lodash.get(values, 'oas', {});

        SwaggerParser.validate(oas)
            .then(api => {
                const openapiVersion = lodash.get(api, 'openapi', '');
                if (lodash.toString(openapiVersion).startsWith('3.')) {
                    this.oasValidator = new ChowChow(api as any);
                }
            })
            .catch(err => {
                logger.error('Error validating OpenAPI Spec', err);
            });
    }

    async runInternal(context: IEsContext) {
        if (this.oasValidator !== undefined) {
            const method = lodash.get(context.properties, lodash.get(this.values, 'method', 'request.method'));
            let path = lodash.get(context.properties, lodash.get(this.values, 'url', 'request.path'), '');
            const body = lodash.get(context.properties, lodash.get(this.values, 'body', 'request.body'));
            const headers = lodash.get(context.properties, lodash.get(this.values, 'headers', 'request.headers'));
            const query = lodash.get(context.properties, lodash.get(this.values, 'query', 'request.query'), {});
            const params = lodash.get(context.properties, lodash.get(this.values, 'params', 'request.params'), {});

            if (!path.startsWith('/')) {
                path = `/${path}`;
            }

            const reqMeta = this.oasValidator.validateRequestByPath(path, method, { body, path: params, header: headers, query });

            if (reqMeta === undefined) {
                throw Error('Invalid request');
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
        "oas"
    ],
    "properties": {
        "oas": {
            "type": "object"
        }
    }
};
