import { IEsTransport, EsParameters, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
import { httpRouter } from '../util/http-server';
import lodash from 'lodash';
import Router from 'koa-router';
import { logger } from '../util/logger';

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
    parameters: EsParameters = {
        'routeContext': {
            type: 'string',
            optional: false
        }
    };
    middleware: IEsMiddleware | undefined;

    routeContext: string;

    router: Router;

    /**
     *
     */
    constructor(params: IEsHttpTransportParams, middleware: IEsMiddleware | undefined) {
        // Verifica padrões
        this.middleware = middleware;
        this.routeContext = params.routeContext;
        this.router = new Router();

        if (!this.routeContext.endsWith('/')) {
            this.routeContext += '/';
        }

        httpRouter.use(this.routeContext, async (ctx, next) => {
            // Prepara a chamada
            const context: IEsContext = {
                properties: {
                    httpctx: ctx,
                    headers: ctx.request.headers,
                    params: ctx.params,
                    query: ctx.query
                },
                parsedbody: ctx.request.body,
                rawbody: ctx.request.rawBody
            };

            ctx.iesContext = context;

            logger.info(`Call ${context.properties.httpctx.path} started at ${new Date().valueOf()}`);

            return next();
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

        httpRouter.use(this.routeContext, async (ctx) => {
            // Captura resultados e escreve a resposta
            logger.info(`Call ${ctx.iesContext.properties.httpctx.path} ended at ${new Date().valueOf()}`);
            ctx.set(lodash.get(ctx.iesContext.properties, 'response.headers') || {});
            ctx.status = lodash.get(ctx.iesContext.properties, 'response.status');
            ctx.body = lodash.get(ctx.iesContext.properties, 'response.body');
        });

        logger.info(`Loaded ${this.routeContext}`);
    }

    clear() {
        httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        logger.info(`Clear ${this.routeContext} executed`);
        logger.debug(httpRouter.stack);
    }
}

export const EsHttpTransportContructor: IEsTranportConstructor = EsHttpTransport;
