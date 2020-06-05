import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import got from 'got';

export class EsHttpRequestMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;
    }

    async runInternal(context: IEsContext) {
        const method = lodash.get(context.properties, 'request.method');
        const path = lodash.get(context.properties, 'request.path') || '/';
        const body = lodash.get(context.properties, 'request.body');
        const headers = lodash.get(context.properties, 'request.headers');

        const res = await got(path.substr(1), {
            prefixUrl: 'http://localhost:5000/api/bla',
            method,
            body,
            headers,
            throwHttpErrors: false
        }).catch(err => {
            logger.error(err);
            return undefined;
        });

        lodash.set(context.properties, 'response.headers', res?.headers || {});
        lodash.set(context.properties, 'response.status', res?.statusCode || 500);
        lodash.set(context.properties, 'response.body', res?.body);
    }

    async execute(context: IEsContext) {
        const rAfter = Boolean(this.values['runAfter']);
        if (rAfter) {
            await this.next?.execute(context);
            await this.runInternal(context);
        }
        else {
            await this.runInternal(context);
            await this.next?.execute(context);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsHttpRequestMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsHttpRequestMiddleware",
    "title": "HttpRequest Middleware",
    "type": "object"
};