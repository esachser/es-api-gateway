import { getHttpRouter } from '../util/http-server-koa';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import { IEsContext } from '../core';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, createMiddleware, connectMiddlewares, copyMiddleware } from '../core/middlewares';

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

    static baseRoutesUsed: Map<string, Set<string>> = new Map<string, Set<string>>();

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
    }

    async loadAsync(params: IEsHttpTransportParams) {
        const httpRouter = getHttpRouter(this.tid);

        if (httpRouter === undefined) {
            throw new EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
        }

        const routeContextSize = this.routeContext.length - 1;

        try {

            for (const path in params.routes) {
                let totalPath = `${this.routeContext}${path}`;
                totalPath = totalPath.replace(/\/{2,}/g, '/');

                for (const methodInfo of params.routes[path]) {
                    const pathMethodMid = await createMiddleware(methodInfo.mids, 0, this.api);
                    const init = copyMiddleware(this.initMiddleware);
                    const mid = copyMiddleware(this.middleware);
                    const middleware = connectMiddlewares(init, pathMethodMid, mid);
                    httpRouter.register(totalPath, [methodInfo.method.toString()], async (ctx, next) => {
                        // Executa middleware central, correspondente a:
                        // pathMids ==> transportMids ==> executionMids
                        //      <========    ||    <==========||
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
                                api: this.api,
                                transport: 'EsHttpTransport',
                                uid: nanoid(12)
                            }
                        };

                        try {
                            await middleware?.execute(context);
                            //return next();
                            ctx.set(_.get(context.properties, 'response.headers', {}));
                            const statusCode = _.get(context.properties, 'response.status');
                            const body = _.get(context.properties, 'response.body');
                            ctx.body = body;
                            ctx.status = _.isNumber(statusCode) ? statusCode : 404;
                        }
                        catch (err) {
                            ctx.set(_.get(context.properties, 'response.headers', {}));
                            ctx.remove('content-encoding');
                            if (err instanceof EsError && err.statusCode < 500) {
                                ctx.body = {
                                    error: err.error,
                                    error_description: err.errorDescription
                                };
                                ctx.status = err.statusCode;
                            }
                            else {
                                const nerr = err instanceof EsError ?
                                    new EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                    new EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });

                                ctx.body = {
                                    error: nerr.error,
                                    error_description: nerr.errorDescription
                                };
                                ctx.status = nerr.statusCode;
                                err = nerr;
                            }

                            context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
                        }
                        ctx.set('host', 'es-api-gateway 0.1.0');
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
                ".*": {
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

