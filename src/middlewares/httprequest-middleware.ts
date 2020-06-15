import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import { logger } from '../util/logger';
import got, { Got } from 'got';
import Keyv  from 'keyv';
import { nanoid } from 'nanoid';
import { EsMiddlewareError } from '../core/errors';

export class EsHttpRequestMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsHttpRequestMiddleware';
    static readonly meta = { middleware: EsHttpRequestMiddleware.middlewareName };

    values: any;

    readonly cache: Keyv | undefined;
    readonly got: Got;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = values;

        const cacheEnabled = Boolean(_.get(values, 'cache.enabled'));
        if (cacheEnabled) {
            const cacheMaxAge = _.get(values, 'cache.maxAge', 1000);
            const cacheMaxSize = _.get(values, 'cache.maxSize', 100);

            if (!_.isInteger(cacheMaxAge)) {
                throw new EsMiddlewareError(EsHttpRequestMiddleware.middlewareName, 'cache.maxAge MUST be integer');
            }
            if (!_.isInteger(cacheMaxSize)) {
                throw new EsMiddlewareError(EsHttpRequestMiddleware.middlewareName, 'cache.maxSize MUST be integer');
            }

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

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const meta = _.merge({}, EsHttpRequestMiddleware.meta, context.meta);
        const method = _.get(context.properties, _.get(this.values, 'method', 'request.method'));
        let path = _.get(context.properties, _.get(this.values, 'url', 'request.path'), '');
        const body = _.get(context.properties, _.get(this.values, 'body', 'request.rawbody'));
        const headers = _.get(context.properties, _.get(this.values, 'headers', 'request.headers'));
        const query = _.get(context.properties, _.get(this.values, 'query', 'request.query'), {});
        const prefixUrl = _.get(context.properties, _.get(this.values, 'prefixUrl'), '');

        // Leitura de opcionais
        const encoding = _.get(context.properties, _.get(this.values, 'encoding'), undefined);
        const timeout = _.get(context.properties, _.get(this.values, 'timeout'), 10000);
        const retry = _.get(context.properties, _.get(this.values, 'retry'), undefined);
        const followRedirect = _.get(context.properties, _.get(this.values, 'followRedirect'), false);
        const maxRedirects = _.get(context.properties, _.get(this.values, 'maxRedirects'), 5);

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
                maxRedirects, 
                hooks: {
                    beforeRequest: [
                        opts => {
                            context.logger.debug('Calling Http endpoint', _.merge({}, opts.headers, meta));
                        }
                    ]
                }
            });

            context.logger.debug('Result received', _.merge({}, _.get(res, ['headers', 'statusCode', 'body']), meta as any));

            _.set(context.properties, 'response.headers', res?.headers || {});
            _.set(context.properties, 'response.status', res?.statusCode || 500);
            _.set(context.properties, 'response.body', res?.body);
        }
        catch (err) {
            context.logger.error('Error calling HTTP endpoint', _.merge(err, meta));
            throw new EsMiddlewareError(EsHttpRequestMiddleware.middlewareName, 'Error calling endpoint', err);
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
                    "type": "integer",
                    "minimum": 0
                },
                "maxSize": {
                    "type": "integer",
                    "minimum": 0
                },
                "enabled": {
                    "type": "boolean"
                }
            }
        }
    }
};