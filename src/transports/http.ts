import { IEsTransport, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
import { httpRouter } from '../util/http-server';
import _ from 'lodash';
import Router from 'koa-router';
import { logger } from '../util/logger';
import { Logger } from 'winston';
import { nanoid } from 'nanoid';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IEsHttpTransportParams {
    routeContext: string,
    routes: { [id: string]: Array<Method> },
    swagger?: any
};

declare module 'koa' {
    interface BaseContext {
        iesContext: IEsContext
    }
}


export class EsHttpTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;

    routeContext: string;

    router: Router;

    static baseRoutesUsed: Set<string> = new Set<string>();

    apiLogger: Logger

    /**
     *
     */
    constructor(params: IEsHttpTransportParams, api: string, apiLogger: Logger, middleware: IEsMiddleware | undefined) {
        // Verifica padrões
        this.apiLogger = apiLogger
        
        if (!params.routeContext.endsWith('/')) {
            params.routeContext += '/';
        }

        // Procura estaticamente e testa se já existe
        for (const basePath of EsHttpTransport.baseRoutesUsed) {
            if (basePath.startsWith(params.routeContext) || params.routeContext.startsWith(basePath)) {
                throw new Error(`Base route already exists. Exists ${basePath} x ${params.routeContext} New`);
            }
        }

        this.middleware = middleware;
        this.routeContext = params.routeContext;
        this.router = new Router();

        const routeContextSize = this.routeContext.length-1;

        httpRouter.use(this.routeContext, async (ctx, next) => {
            // Prepara a chamada
            let allPath = ctx.path;
            if (!allPath.endsWith('/')) {
                allPath += '/';
            }
            const context: IEsContext = {
                properties: {
                    request: {
                        httpctx: ctx,
                        headers: ctx.request.headers,
                        params: ctx.params,
                        query: ctx.query,
                        path: allPath.substr(routeContextSize),
                        method: ctx.method,
                        body: ctx.request.body,
                        rawbody: ctx.request.rawBody,
                        routePrefix: this.routeContext
                    }
                },
                parsedbody: ctx.request.body,
                rawbody: ctx.request.rawBody,
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

            try{
                // Roda o que precisa
                await next();
            }
            catch (err) {
                context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
            }
            
            ctx.set(_.get(ctx.iesContext.properties, 'response.headers', {}));
            const statusCode = _.get(ctx.iesContext.properties, 'response.status');
            ctx.status = _.isNumber(statusCode) ? statusCode : 404;
            ctx.body = _.get(ctx.iesContext.properties, 'response.body');
            
            let diff = Date.now() - init;
            logger.debug(`Call ${ctx.iesContext.properties.request.httpctx.path} ended in ${diff}ms`);
        });

        Object.keys(params.routes).forEach(path => {
            let totalPath = `${this.routeContext}${path}`;
            totalPath = totalPath.replace(/\/{2,}/g,'/');

            httpRouter.register(totalPath, params.routes[path].map(t => t.toString()), async (ctx, next) => {
                // Executa middleware central
                await this.middleware?.execute(ctx.iesContext);
                return next();
            });
        });

        EsHttpTransport.baseRoutesUsed.add(params.routeContext);
        logger.info(`Loaded ${this.routeContext}`);
    }

    async loadAsync() {}

    clear() {
        httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        EsHttpTransport.baseRoutesUsed.delete(this.routeContext);
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
                    "items" : {
                        "type": "string",
                        "enum": ["GET", "POST", "PATCH", "PUT", "DELETE"]
                    }
                }
            }
        },
        "routeContext": {
            "type": "string"
        }
    }
};

