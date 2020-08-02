import { IEsTransport, IEsMiddleware, IEsContext, IEsTranportConstructor, createMiddleware, connectMiddlewares } from '../core';
import { getHttpRouter } from '../util/http-server';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IEsHttpTransportParams {
    routeContext: string,
    routes: { [id: string]: Array<{ method: Method, mids: Array<any> }> },
    swagger?: any
};

declare module 'koa' {
    interface BaseContext {
        iesContext: IEsContext
    }
}


export class EsHttpTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;
    initMiddleware: IEsMiddleware | undefined;

    routeContext: string;

    static baseRoutesUsed: Map<string,Set<string>> = new Map<string, Set<string>>();

    apiLogger: Logger;

    api: string;

    tid: string;

    /**
     *
     */
    constructor(params: IEsHttpTransportParams, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;

        const httpRouter = getHttpRouter(tid);

        if (httpRouter === undefined) {
            throw new EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
        }

        if (!params.routeContext.endsWith('/')) {
            params.routeContext += '/';
        }

        // Procura estaticamente e testa se já existe
        const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        if (basePaths !== undefined) {
            for (const basePath of basePaths) {
                if (basePath.startsWith(params.routeContext) || params.routeContext.startsWith(basePath)) {
                    throw new Error(`Base route already exists. Exists ${basePath} x ${params.routeContext} New`);
                }
            }
            basePaths.add(params.routeContext);
        }
        else {
            EsHttpTransport.baseRoutesUsed.set(this.tid, new Set<string>([params.routeContext]));
        }

        this.middleware = middleware;
        this.initMiddleware = initMiddleware;
        this.routeContext = params.routeContext;
        const routeContextSize = this.routeContext.length - 1;

        try {
            httpRouter.use(this.routeContext, async (ctx, next) => {
                // Prepara a chamada
                let allPath = ctx.path;
                if (!allPath.endsWith('/')) {
                    allPath += '/';
                }
                const context: IEsContext = {
                    properties: {
                        request: {
                            headers: ctx.request.headers,
                            params: ctx.params,
                            query: ctx.query,
                            path: allPath.substr(routeContextSize),
                            method: ctx.method,
                            routePrefix: this.routeContext
                        },
                        httpctx: ctx
                    },
                    body: ctx.request.body,
                    logger: this.apiLogger,
                    meta: {
                        api,
                        transport: 'EsHttpTransport',
                        uid: nanoid(12)
                    }
                };

                logger.info(`Started api with path ${context.properties.request.path}`);

                ctx.iesContext = context;

                //logger.info(`Call ${context.properties.httpctx.path} started at ${new Date().valueOf()}`);
                let init = Date.now();

                try {
                    // Roda o que precisa
                    await next();

                    ctx.set(_.get(ctx.iesContext.properties, 'response.headers', {}));
                    const statusCode = _.get(ctx.iesContext.properties, 'response.status');
                    ctx.status = _.isNumber(statusCode) ? statusCode : 404;
                    const body = _.get(ctx.iesContext.properties, 'response.body');
                    // const bodyJson = await parsers.transform(body, {
                    //     bta: {
                    //         parser: 'EsJson'
                    //     }
                    // });
                    // const bodyXml = await parsers.transform(bodyJson, {
                    //     atb: {
                    //         parser: 'EsXml'
                    //     }
                    // });
                    // ctx.set('content-type', 'application/xml');
                    ctx.body = body;
                    //ctx.body = _.get(ctx.iesContext.properties, 'response.body');
                    // const encoding = 'deflate';
                    // ctx.set('content-encoding', encoding);
                    // ctx.remove('content-length');
                    // ctx.body = await parsers.transform(_.get(ctx.iesContext.properties, 'response.body'), {
                    //     btb: [
                    //         {
                    //             parser: 'EsCompress',
                    //             opts: {
                    //                 encoding
                    //             }
                    //         }
                    //     ]
                    // });
                }
                catch (err) {
                    for (const key in _.get(ctx.iesContext.properties, 'response.headers', {})) {
                        ctx.remove(key);
                    }
                    ctx.set('host', 'es-api-gateway 0.1.0');
                    ctx.remove('content-encoding');
                    if (err instanceof EsError && err.statusCode < 500) {
                        ctx.status = err.statusCode;
                        ctx.body = {
                            error: err.error,
                            error_description: err.errorDescription
                        };
                    }
                    else {
                        const nerr = err instanceof EsError ?
                            new EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                            new EsTransportError(EsHttpTransport.name, 'Error running middlewares', {message: err.message});

                        ctx.status = nerr.statusCode;
                        ctx.body = {
                            error: nerr.error,
                            error_description: nerr.errorDescription
                        };
                        err = nerr;
                    }
                    
                    context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
                }

                let diff = Date.now() - init;
                logger.info(`Call ${ctx.path} ended in ${diff}ms`);
            });
        }
        catch (err) {
            this.clear();
            throw new EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
        }
    }

    async loadAsync(params: IEsHttpTransportParams) {
        const httpRouter = getHttpRouter(this.tid);

        if (httpRouter === undefined) {
            throw new EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
        }

        try {

            for (const path in params.routes) {
                let totalPath = `${this.routeContext}${path}`;
                totalPath = totalPath.replace(/\/{2,}/g, '/');

                for (const methodInfo of params.routes[path]) {
                    const pathMethodMid = await createMiddleware(methodInfo.mids, 0, this.api);
                    const middleware = connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                    httpRouter.register(totalPath, [methodInfo.method.toString()], async (ctx, next) => {
                        // Executa middleware central, correspondente a:
                        // pathMids ==> transportMids ==> executionMids
                        //      <========    ||    <==========||
                        await middleware?.execute(ctx.iesContext);
                        return next();
                    });
                }
            }
        }
        catch (err) {
            this.clear();
            throw new EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
        }

        logger.info(`Loaded ${this.routeContext}`);
    }

    clear() {
        const httpRouter = getHttpRouter(this.tid);

        if (httpRouter === undefined) {
            return;
        }

        httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        if (basePaths !== undefined) {
            basePaths.delete(this.routeContext);
        }
        logger.info(`Clear ${this.routeContext} executed`);
        logger.debug(httpRouter.stack);
    }
}

export const TransportContructor: IEsTranportConstructor = EsHttpTransport;

export const TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsHttpTransport",
    "title": "Http Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "routeContext",
        "routes"
    ],
    "properties": {
        "routes": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
                "^\\/([a-z0-9\\-._~%!$&'()*+,;=:@/]*)$": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "method": {
                                "type": "string",
                                "enum": ["GET", "POST", "PATCH", "PUT", "DELETE"]
                            },
                            "mids": {
                                "type": "array",
                                "items": {
                                    "$ref": "es-middleware"
                                }
                            }
                        }
                    }
                }
            }
        },
        "routeContext": {
            "type": "string"
        }
    }
};

