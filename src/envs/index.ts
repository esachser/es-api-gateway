import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import { baseDirectory } from '../util';
import { logger, createLogger } from '../util/logger';
import { IEsMiddleware, IEsTransport, createMiddleware, connectMiddlewares, createTransport } from '../core';
import { httpRouter } from '../util/http-server';
import { validateObject } from '../core/schemas';
import { Logger } from 'winston';

interface IEsApi {
    transports: { [id: string]: IEsTransport },
    central: IEsMiddleware | undefined,
    logger: Logger | undefined,
}

let apis: { [id: string]: IEsApi } = {};

async function loadApiFile(fname: string) {
    const apiJson = JSON.parse((await fsasync.readFile(fname)).toString());

    logger.debug(apiJson);
    fname = path.basename(fname, '.json');

    let api: IEsApi = apis[fname] || {
        transports: [],
        central: {},
        logger: {},
    };

    delete apis[fname];

    for (const tname of Object.keys(api.transports)) {
        if (api.transports[tname] !== undefined) {
            api.transports[tname].clear();
            api.logger?.close();
            delete api.transports[tname];
        }
    }

    if (!(await validateObject('es-api', apiJson))) {
        return;
    }

    // Carrega Middlewares centrais.
    const executionJs = lodash.get(apiJson, 'execution') as any[];
    const centralMid = await createMiddleware(executionJs, 0);
    let logLevel = lodash.get(apiJson, 'logging.level', 'info');
    if (!lodash.isString(logLevel)) {
        logLevel = 'info';
    }

    api.central = centralMid;
    api.logger = createLogger(logLevel, fname);

    const transports = lodash.get(apiJson, 'transports');

    if (transports !== undefined && lodash.isArray(transports)) {
        for (const transport of transports) {
            const type = lodash.get(transport, 'type');
            const id = lodash.get(transport, 'id');
            const parameters = lodash.get(transport, 'parameters');
            const mids = lodash.get(transport, 'mids') as any[];

            const pre = await createMiddleware(mids, 0);

            const mid = connectMiddlewares(pre, centralMid);

            if (api.transports[id] !== undefined) {
                api.transports[id].clear();
                delete api.transports[id];
            }

            const trp = await createTransport(type, fname, api.logger, parameters, mid);

            if (trp !== undefined) {
                api.transports[id] = trp;
            }
        }
    }

    apis[fname] = api;
}

async function reloadEnv(dir: string) {
    const finfos = await fsasync.readdir(dir, { withFileTypes: true });

    finfos.filter(f => f.isFile() && f.name.endsWith('.json')).forEach(finfo => {
        logger.info(`Loading API ${finfo.name}`);

        loadApiFile(path.resolve(dir, finfo.name)).catch(e => {
            logger.error(`Error loading file ${finfo.name}`, e);
        });
    });
}

let watcher: fs.FSWatcher | undefined = undefined;

export async function loadEnv(envName: string) {
    const envDir = path.resolve(baseDirectory, 'envs', envName);

    const envDirExists = fs.existsSync(envDir);

    if (watcher !== undefined) {
        watcher.close();
        httpRouter.stack = [];
    }

    if (envDirExists) {
        const envFinfo = await fsasync.stat(envDir);
        if (envFinfo.isDirectory()) {
            reloadEnv(envDir);
            watcher = fs.watch(envDir, (ev, fname) => {
                if (fname.endsWith('.json')) {
                    // reloadEnv(envDir);
                    logger.info(`Reloading ${fname}.`);
                    loadApiFile(path.resolve(envDir, fname)).catch(err => {
                        logger.error(`Error reloading file ${fname}.`, err);
                    });
                }
            });
        }
    }
};

