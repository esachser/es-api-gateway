import koa from 'koa';
import Router from 'koa-router';
import helmet from 'koa-helmet';
import getRawBody from 'raw-body';
import contentType from 'content-type';
import koaBody from 'koa-body';
import { configuration } from './config';
import { logger } from './logger';
import _ from 'lodash';
import http from 'http';
import https from 'https';
import fs from 'fs';

const routers: {[id: string]: Router} = {};

export function getHttpRouter(id: string) {
    return routers[id];
}

export function clearRouters() {
    for (const k in routers) {
        routers[k].stack = [];
    }
}

//export const httpRouter = new Router();

export function loadHttpServer(conf: any) {
    const port = _.get(conf, 'port');
    const secure = _.get(conf, 'secure', false);
    const id = _.get(conf, 'id');
    
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

    const httpRouter = new Router();
    routers[id] = httpRouter;
    app.use(httpRouter.routes()).use(httpRouter.allowedMethods());

    app.on('error', (err, ctx) => {
        logger.error('Erro no servidor HTTP', err);
    });

    if (secure) {
        const keyFile = _.get(conf, 'keyFile');
        const passphrase = _.get(conf, 'passphrase');
        const certFile = _.get(conf, 'certFile');
        
        const server = https.createServer({
            key: fs.readFileSync(keyFile, 'binary'),
            passphrase,
            cert: fs.readFileSync(certFile, 'binary')
        }, app.callback()).listen(port, () => {
            const { port } = server.address() as import('net').AddressInfo;
            logger.info(`Http Server running on port ${port}`);
        });
    }
    else {
        const server = http.createServer(app.callback()).listen(port, () => {
            const { port } = server.address() as import('net').AddressInfo;
            logger.info(`Http Server running on port ${port}`);
        });
    }
}

export function loadHttpServers() {
    const httpConfs = configuration.transports?.filter(c => c.type === 'http');
    if (httpConfs === undefined) return;
    for (const cnf of httpConfs) {
        try{
            loadHttpServer(cnf);
        }
        catch(err) {
            logger.error('Error loading Http Server', err);
        }
    }
}
