import koa from 'koa';
import Router from '@koa/router';
//import router from 'koa-router-find-my-way';
import helmet from 'koa-helmet';
import { configuration } from './config';
import { logger } from './logger';
import _ from 'lodash';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { Server } from 'net';

const routers: {
    [id: string]: {
        router?: Router,
        server?: Server
    }
} = {};

export function getHttpRouter(id: string) {
    return routers[id].router;
}

export function clearRouters() {
    for (const k in routers) {
        const r = routers[k].router;
        if (r !== undefined) {
            r.stack = [];
            // r.reset();
        }
    }
}

export function loadHttpServer(conf: any) {
    const port = _.get(conf, 'port');
    const secure = _.get(conf, 'secure', false);
    const id = _.get(conf, 'id');

    const app = new koa();

    app.use(helmet());
    
    app.use(async (ctx, next) => {
        await next();
        if (ctx.status === 404 && ctx.body === undefined) {
            ctx.body = {
                error: 'Not Found'
            };
            ctx.status = 404;
        }
        else if (ctx.status === 405 && ctx.body === undefined) {
            ctx.body = {
                error: 'Method not allowed'
            };
            ctx.status = 405;
        }
    });

    const httpRouter = routers[id]?.router ?? new Router();
    // const httpRouter = routers[id]?.router ?? router();
    _.set(routers, `[${id}].router`, httpRouter);
    app.use(httpRouter.routes()).use(httpRouter.allowedMethods());
    // app.use(httpRouter.routes());

    app.on('error', (err, ctx) => {
        logger.error('Erro no servidor HTTP', err);
    });

    return new Promise((resolve, reject) => {
        let server: Server | undefined = routers[id]?.server;
        function createServer() {
            if (secure) {
                const keyFile = _.get(conf, 'keyFile');
                const passphrase = _.get(conf, 'passphrase');
                const certFile = _.get(conf, 'certFile');
                server = https.createServer({
                    key: fs.readFileSync(keyFile, 'binary'),
                    passphrase,
                    cert: fs.readFileSync(certFile, 'binary'),
                    requestCert: true,
                    rejectUnauthorized: false
                }, app.callback()).listen(port, () => {
                    const { port } = server?.address() as import('net').AddressInfo;
                    logger.info(`Https Server running on port ${port}`);
                    return resolve();
                });
            }
            else {
                server = http.createServer(app.callback()).listen(port, () => {
                    const { port } = server?.address() as import('net').AddressInfo;
                    logger.info(`Http Server running on port ${port}`);
                    return resolve();
                });
            }
            server.once('error', err => {
                reject(err);
            });
            _.set(routers, `[${id}].server`, server);
        }

        if (server !== undefined) {
            server.close(err => {
                if (err) return reject(err);
                createServer();
            });
        }
        else {
            createServer();
        }
    });
}

export async function loadHttpServers() {
    const httpConfs = configuration.transports?.filter(c => c.type === 'http');
    if (httpConfs === undefined) return;
    for (const cnf of httpConfs) {
        try {
            await loadHttpServer(cnf);
        }
        catch (err) {
            logger.error('Error loading Http Server', err);
        }
    }
}
