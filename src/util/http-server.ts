import koa from 'koa';
import Router from 'koa-router';
import helmet from 'koa-helmet';
import getRawBody from 'raw-body';
import contentType from 'content-type';
import koaBody from 'koa-body';
import { configuration } from './config';
import { logger } from './logger';

declare module 'koa' {
    interface BaseRequest {
        parsedBody?: any
    }
}

const unparsed = Symbol.for('unparsedBody');

export const httpRouter = new Router();

export function loadHttpServer() {
    const app = new koa();
    
    app.use(async (ctx,next) => {
        // Avaliando tempo de execução total da aplicação koa
        let init = Date.now();
        await next();
        let diff = Date.now() - init;
        logger.debug(`Total app process time: ${diff}ms`);
    });

    app.use(helmet());

    app.use(async (ctx, next) => {
        await next();
        if (ctx.status === 404 && ctx.body === undefined) {
            ctx.body = {
                error: 'Not Found'
            };
        }
    });

    app.use(koaBody({
        includeUnparsed: true,
    }));

    app.use(async (ctx, next) => {
        if (ctx.request.body !== undefined) {
            const raw = ctx.request.body[unparsed];
            ctx.request.parsedBody = ctx.request.body;
            ctx.request.body = raw;
        }
        return next();
    });

    app.use(httpRouter.routes()).use(httpRouter.allowedMethods());
    
    const server = app.listen(configuration.httpPort || 3000, () => {
        const { port } = server.address() as import('net').AddressInfo;
        logger.info(`Http Server running on port ${port}`);
    });

    app.on('error', (err, ctx) => {
        logger.error('Erro no servidor HTTP', err);
    });
}
