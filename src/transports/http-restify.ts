import { getHttpRouter } from '../util/http-server-restify';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import { IEsContext } from '../core';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, createMiddleware, connectMiddlewares } from '../core/middlewares';

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

    private _routeNames: string[] = []

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
                    const middleware = connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                    const rname = httpRouter.router.mount({
                        method: methodInfo.method.toUpperCase(),
                        path: totalPath
                    } as any, [async (req, res, next) => {
                        // Executa middleware central, correspondente a:
                        // pathMids ==> transportMids ==> executionMids
                        //      <========    ||    <==========||
                        // Prepara a chamada
                        let allPath = req.path();
                        if (!allPath.endsWith('/')) {
                            allPath += '/';
                        }
                        const context: IEsContext = {
                            properties: {
                                request: {
                                    headers: req.headers,
                                    params: req.params,
                                    query: req.query,
                                    path: allPath.substr(routeContextSize),
                                    method: req.method,
                                    routePrefix: this.routeContext
                                },
                                httpctx: {
                                    req
                                }
                            },
                            body: req.body,
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
                            res.set(_.get(context.properties, 'response.headers', {}));
                            res.set('host', 'es-api-gateway 0.1.0');
                            const statusCode = _.get(context.properties, 'response.status');
                            const body = _.get(context.properties, 'response.body');
                            res.status(_.isNumber(statusCode) ? statusCode : 404);
                            res.send(body);
                        }
                        catch (err) {
                            res.set(_.get(context.properties, 'response.headers', {}));
                            res.removeHeader('content-encoding');
                            res.set('host', 'es-api-gateway 0.1.0');
                            if (err instanceof EsError && err.statusCode < 500) {
                                res.status(err.statusCode);
                                res.send({
                                    error: err.error,
                                    error_description: err.errorDescription
                                });
                            }
                            else {
                                const nerr = err instanceof EsError ?
                                    new EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                    new EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });

                                res.status(nerr.statusCode);
                                res.send({
                                    error: nerr.error,
                                    error_description: nerr.errorDescription
                                });
                                
                                err = nerr;
                            }

                            context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
                        }
                    }]) as any;
                    this._routeNames.push(rname.name);
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

        //httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        for (const rname of this._routeNames) {
            httpRouter.rm(rname);
        }
        const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        if (basePaths !== undefined) {
            basePaths.delete(this.routeContext);
        }
        logger.info(`Clear ${this.routeContext} executed`);
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

