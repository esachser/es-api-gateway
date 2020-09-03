import restify from 'restify';
import helmet from 'helmet';
import { configuration } from './config';
import { logger } from './logger';
import _, { reject } from 'lodash';
import fs from 'fs';
import util from 'util';

const routers: {
    [id: string]: {
        router?: restify.Server
    }
} = {};

export function getHttpRouter(id: string) {
    return routers[id].router;
}

export function clearRouters() {
    // for (const k in routers) {
    //     const r = routers[k].router;
    //     if (r !== undefined) {
    //         r.
    //         // r.reset();
    //     }
    // }
}

export async function loadHttpServer(conf: any) {
    const port = _.get(conf, 'port');
    const secure = _.get(conf, 'secure', false);
    const id = _.get(conf, 'id');

    let app = routers[id]?.router;
    if (app) {
        await util.promisify(app.close());
    }

    if (secure) {
        const keyFile = _.get(conf, 'keyFile');
        const passphrase = _.get(conf, 'passphrase');
        const certFile = _.get(conf, 'certFile');
        app = restify.createServer({
            httpsServerOptions: {
                key: fs.readFileSync(keyFile, 'binary'),
                passphrase,
                cert: fs.readFileSync(certFile, 'binary'),
            }
        });
    }
    else {
        app = restify.createServer();
    }

    app.use(helmet());

    _.set(routers, `[${id}].router`, app);

    app.router.defaultRoute = (req, res, next) => {
        res.set('host', 'es-api-gateway 0.1.0');
        res.send(404, {
            error: 'Not Found'
        });
        return next();
    };

    const ap = app;

    await new Promise((res, rej) => ap.listen(port, '0.0.0.0', (err: any) => {
        if (!!err) {
            return rej(err);
        }
        logger.info(`HTTP server ${id} listening on port ${port}`);
        return res();
    }));
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
