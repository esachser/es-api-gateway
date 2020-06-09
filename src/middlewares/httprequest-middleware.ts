import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';
import { logger } from '../util/logger';
import got, { Got } from 'got';
import Keyv  from 'keyv';
import { nanoid } from 'nanoid';

export class EsHttpRequestMiddleware implements IEsMiddleware {
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    readonly cache: Keyv | undefined;
    readonly got: Got;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;

        const cacheEnabled = Boolean(lodash.get(values, 'cache.enabled'));
        if (cacheEnabled) {
            const cacheMaxAge = lodash.get(values, 'cache.maxAge', 1000);
            const cacheMaxSize = lodash.get(values, 'cache.maxSize', 100);
            this.cache = new Keyv('redis://localhost:6379', {
                maxSize: cacheMaxSize,
                ttl: cacheMaxAge,
                namespace: `gotcache:${nanoid(12)}`
            });
        }
        this.got = got.extend({
            throwHttpErrors: false,
            cache: this.cache
        });
    }

    async runInternal(context: IEsContext) {
        const method = lodash.get(context.properties, lodash.get(this.values, 'method', 'request.method'));
        let path = lodash.get(context.properties, lodash.get(this.values, 'url', 'request.path'), '');
        const body = lodash.get(context.properties, lodash.get(this.values, 'body', 'request.body'));
        const headers = lodash.get(context.properties, lodash.get(this.values, 'headers', 'request.headers'));
        const query = lodash.get(context.properties, lodash.get(this.values, 'query', 'request.query'), {});
        const prefixUrl = lodash.get(context.properties, lodash.get(this.values, 'prefixUrl'), '');

        // Leitura de opcionais
        const encoding = lodash.get(context.properties, lodash.get(this.values, 'encoding'), undefined);
        const timeout = lodash.get(context.properties, lodash.get(this.values, 'timeout'), 10000);
        const retry = lodash.get(context.properties, lodash.get(this.values, 'retry'), undefined);
        const followRedirect = lodash.get(context.properties, lodash.get(this.values, 'followRedirect'), false);
        const maxRedirects = lodash.get(context.properties, lodash.get(this.values, 'maxRedirects'), 5);

        if (path.startsWith('/')) {
            path = path.substr(1);
        }

        try {
            const res = await this.got(path, {
                prefixUrl,
                method,
                body,
                headers,
                searchParams: query,
                encoding,
                timeout,
                retry,
                followRedirect,
                maxRedirects
            });

            lodash.set(context.properties, 'response.headers', res?.headers || {});
            lodash.set(context.properties, 'response.status', res?.statusCode || 500);
            lodash.set(context.properties, 'response.body', res?.body);
        }
        catch (err) {
            logger.error('Error calling HTTP endpoint', err);
        }
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
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "runAfter": {
            "type": "boolean"
        },
        "url": {
            "type": "string"
        },
        "prefixUrl": {
            "type": "string"
        },
        "method": {
            "type": "string"
        },
        "query": {
            "type": "string"
        },
        "headers": {
            "type": "string"
        },
        "body": {
            "type": "string"
        },
        "encoding": {
            "type": "string"
        },
        "timeout": {
            "type": "string"
        },
        "retry": {
            "type": "string"
        },
        "followRedirect": {
            "type": "boolean"
        },
        "maxRedirects": {
            "type": "string"
        },
        "cache": {
            "type": "object",
            "additionalProperties": false,
            "required": [
                "enabled",
                "maxAge",
                "maxSize"
            ],
            "properties": {
                "maxAge": {
                    "type": "number"
                },
                "maxSize": {
                    "type": "number"
                },
                "enabled": {
                    "type": "boolean"
                }
            }
        }
    }
};