import koa from 'koa';
import Router from 'koa-router';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';

import { configuration } from './config';
import { logger } from './logger';

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

    app.use(bodyParser());
    app.use(httpRouter.routes()).use(httpRouter.allowedMethods());
    
    const server = app.listen(configuration.httpPort || 3000, () => {
        const { port } = server.address() as import('net').AddressInfo;
        logger.info(`Http Server running on port ${port}`);
    });

    app.on('error', (err, ctx) => {
        logger.error('Erro no servidor HTTP', err);
    });
}
