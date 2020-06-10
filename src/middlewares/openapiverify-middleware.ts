import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor, createMiddleware } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import SwaggerParser from '@apidevtools/swagger-parser';
import ChowChow from "oas3-chow-chow";

export class EsOpenApiVerifyMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    oasValidator?: ChowChow;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = {};
        this.values['after'] = values['after'];
        this.next = nextMiddleware;

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

    async runIntenal(context: IEsContext) {
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

    async execute(context: IEsContext) {
        const rAfter = Boolean(this.values['after'])
        if (!rAfter) {
            await this.runIntenal(context);
        }
        await this.next?.execute(context);
        if (rAfter) {
            await this.runIntenal(context);
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
        "after",
        "oas"
    ],
    "properties": {
        "after": {
            "type": "boolean"
        },
        "oas": {
            "type": "object"
        }
    }
};
