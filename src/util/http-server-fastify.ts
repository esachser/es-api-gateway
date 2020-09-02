import fastify, { FastifyInstance } from 'fastify';
import helmet from 'fastify-helmet';
import { configuration } from './config';
import { logger } from './logger';
import _ from 'lodash';
import fs from 'fs';

const routers: {
    [id: string]: {
        router?: FastifyInstance
        port: number;
    }
} = {};

export function getHttpRouter(id: string) {
    return routers[id].router;
}

export function clearRouters() {
    // for (const k in routers) {
    //     const r = routers[k].router;
    //     if (r !== undefined) {
    //         r.stack = [];
    //     }
    // }
}

export async function runServers() {
    for (const k in routers) {
        const r = routers[k].router;
        if (r !== undefined) {
            await r.listen(routers[k].port, '0.0.0.0');
            console.log(r.printRoutes());
        }
    }
}

export async function loadHttpServer(conf: any) {
    const port = _.get(conf, 'port');
    const secure = _.get(conf, 'secure', false);
    const id = _.get(conf, 'id');

    let app: FastifyInstance;

    let server: FastifyInstance | undefined = routers[id]?.router;

    if (server !== undefined) {
        await server.close();
    }
    
    if (secure) {
        const keyFile = _.get(conf, 'keyFile');
        const passphrase = _.get(conf, 'passphrase');
        const certFile = _.get(conf, 'certFile');
        app = fastify({
            https: {
                key: fs.readFileSync(keyFile, 'binary'),
                passphrase,
                cert: fs.readFileSync(certFile, 'binary')
            }
        });
    }
    else {
        app = fastify();
    }

    app.addHook('onResponse', (request, response) => {
        const diff = response.getResponseTime();
        logger.debug(`Total app process time: ${diff}ms`);
    });

    app.register(helmet);

    app.setNotFoundHandler((request, reply) => {
        reply.send({
            error: 'Not Found'
        });
        reply.status(404);
    });

    app.addContentTypeParser('*', function (request, payload, done) {
        done(null);
    });

    _.set(routers, `[${id}].router`, app);

    app.setErrorHandler((error, request, reply) => {
        logger.error(`Error in Http Server id=${id} url=${request.routerPath}`, error);
        reply.send({
            error: 'Error processing request',
            message: 'Contact administrator for more details'
        });
        reply.status(500);
    });

    //await app.listen(port, '0.0.0.0');
    _.set(routers, `[${id}].port`, port);
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
