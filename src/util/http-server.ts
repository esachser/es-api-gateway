import koa from 'koa';
import Router from 'koa-router';
import helmet from 'koa-helmet';
import bodyParser from 'koa-bodyparser';

import { configuration } from './config';
import { logger } from './logger';

export const httpRouter = new Router();

export function loadHttpServer() {
    const app = new koa();
    app.use(helmet());

    app.use(bodyParser());
    app.use(httpRouter.middleware());
    
    const server = app.listen(configuration.httpPort || 3000, () => {
        const { port } = server.address() as import('net').AddressInfo;
        logger.info(`Http Server running on port ${port}`);
    });
}
