import { getHttpRouter, runServers } from '../util/http-server-fastify';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import { IEsContext } from '../core';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, createMiddleware, connectMiddlewares } from '../core/middlewares';
import { HTTPMethods } from 'fastify';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IEsHttpTransportParams {
    routeContext: string,
    routes: { [id: string]: Array<{ method: Method, mids: Array<any> }> },
    swagger?: any
};

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

        // if (httpRouter.server.listening) {
        //     await httpRouter.close();
        // }

        const routeContextSize = this.routeContext.length - 1;
        try {

            for (const path in params.routes) {
                let totalPath = `${this.routeContext}${path}`;
                totalPath = totalPath.replace(/\/{2,}/g, '/');

                for (const methodInfo of params.routes[path]) {
                    const pathMethodMid = await createMiddleware(methodInfo.mids, 0, this.api);
                    const middleware = connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                    // httpRouter.register(totalPath, [methodInfo.method.toString()], async (ctx, next) => {
                    //     // Executa middleware central, correspondente a:
                    //     // pathMids ==> transportMids ==> executionMids
                    //     //      <========    ||    <==========||
                    //     await middleware?.execute(ctx.iesContext);
                    //     return next();
                    // });
                    httpRouter.route({
                        method: (methodInfo.method.toString().toUpperCase() as HTTPMethods),
                        url: totalPath,
                        handler: async (request, reply) => {
                            // Prepara a chamada
                            const api = this.api;
                            let allPath = request.url;

                            if (!allPath.endsWith('/')) {
                                allPath += '/';
                            }
                            const context: IEsContext = {
                                properties: {
                                    request: {
                                        headers: request.headers,
                                        params: request.params,
                                        query: request.query,
                                        path: allPath.substr(routeContextSize),
                                        method: request.method,
                                        routePrefix: this.routeContext
                                    },
                                    httpctx: request
                                },
                                body: '',
                                logger: this.apiLogger,
                                meta: {
                                    api,
                                    transport: 'EsHttpTransport',
                                    uid: nanoid(12)
                                }
                            };
                            try {
                                // Roda o que precisa
                                await middleware?.execute(context);
                                reply.headers(_.get(context.properties, 'response.headers', {}));
                                const statusCode = _.get(context.properties, 'response.status');
                                reply.status(_.isNumber(statusCode) ? statusCode : 404);
                                const body = _.get(context.properties, 'response.body');
                                reply.send(body);
                            }
                            catch (err) {
                                reply.headers(_.get(context.properties, 'response.headers', {}));
                                reply.header('host', 'es-api-gateway 0.1.0');
                                reply.removeHeader('content-encoding');
                                if (err instanceof EsError && err.statusCode < 500) {
                                    reply.status(err.statusCode);
                                    reply.send({
                                        error: err.error,
                                        error_description: err.errorDescription
                                    });
                                }
                                else {
                                    const nerr = err instanceof EsError ?
                                        new EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                        new EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });

                                    reply.status(nerr.statusCode);
                                    reply.send({
                                        error: nerr.error,
                                        error_description: nerr.errorDescription
                                    });
                                    err = nerr;
                                }
                                context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
                            }
                        }
                    });
                }
            }
            //await runServers();
        }
        catch (err) {
            this.clear();
            throw new EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
        }

        logger.info(`Loaded ${this.routeContext}`);
    }

    clear() {
        // const httpRouter = getHttpRouter(this.tid);

        // if (httpRouter === undefined) {
        //     return;
        // }

        // httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        // const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        // if (basePaths !== undefined) {
        //     basePaths.delete(this.routeContext);
        // }
        // logger.info(`Clear ${this.routeContext} executed`);
        // logger.debug(httpRouter.stack);
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

