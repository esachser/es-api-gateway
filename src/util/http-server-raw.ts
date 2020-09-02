import { configuration } from './config';
import { logger } from './logger';
import _ from 'lodash';
import fs from 'fs';
import Router from 'find-my-way';
import http from 'http';
import https from 'https';
import { Server } from 'net';

const routers: {
    [id: string]: {
        router?: Router.Instance<Router.HTTPVersion.V1>
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
            r.reset();
        }
    }
}

export async function loadHttpServer(conf: any) {
    const port = _.get(conf, 'port');
    const secure = _.get(conf, 'secure', false);
    const id = _.get(conf, 'id');

    let app = Router({
        ignoreTrailingSlash: true
    });

    //app.register(helmet);

    _.set(routers, `[${id}].router`, app);

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
                    cert: fs.readFileSync(certFile, 'binary')
                }, (req, res) => {
                    app.lookup(req, res);
                }).listen(port, () => {
                    const { port } = server?.address() as import('net').AddressInfo;
                    logger.info(`Https Server running on port ${port}`);
                    return resolve();
                });
            }
            else {
                server = http.createServer((req, res) => {
                    app.lookup(req, res);
                }).listen(port, () => {
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
