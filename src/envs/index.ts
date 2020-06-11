import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { IEsMiddleware, IEsTransport, createMiddleware, connectMiddlewares, createTransport } from '../core';
import { httpRouter } from '../util/http-server';
import { validateObject } from '../core/schemas';

interface IEsApi {
    transports: { [id: string]: IEsTransport },
    central: IEsMiddleware | undefined;
}

let apis: { [id: string]: IEsApi } = {};

async function loadApiFile(fname: string) {
    const apiJson = JSON.parse((await fsasync.readFile(fname).catch(e => { throw e })).toString());

    logger.debug(apiJson);

    if (!(await validateObject('es-api', apiJson).catch(e => { throw e }))) {
        return;
    }

    // Carrega Middlewares centrais.
    const executionJs = lodash.get(apiJson, 'execution') as any[];
    const centralMid = await createMiddleware(executionJs, 0).catch(e => { throw e });

    let api: IEsApi = apis[fname] || {
        transports: [],
        central: centralMid
    };

    const transports = lodash.get(apiJson, 'transports');

    if (transports !== undefined && lodash.isArray(transports)) {
        for await (const transport of transports) {
            const type = lodash.get(transport, 'type');
            const id = lodash.get(transport, 'id');
            const parameters = lodash.get(transport, 'parameters');
            const mids = lodash.get(transport, 'mids') as any[];

            const pre = await createMiddleware(mids, 0).catch(e => { throw e });

            const mid = connectMiddlewares(pre, centralMid);

            if (api.transports[id] !== undefined) {
                api.transports[id].clear();
                delete api.transports[id];
            }

            const trp = await createTransport(type, parameters, mid).catch(e => { throw e });

            if (trp !== undefined) {
                api.transports[id] = trp;
            }
        }
    }

    apis[fname] = api;
}

async function reloadEnv(dir: string) {
    const finfos = await fsasync.readdir(dir, { withFileTypes: true }).catch(e => { throw e });

    finfos.filter(f => f.isFile() && f.name.endsWith('.json')).forEach(finfo => {
        logger.info(`Loading API ${finfo.name}`);

        loadApiFile(path.resolve(dir, finfo.name)).catch(e => {
            logger.error(`Error loding file ${finfo.name}`, e);
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
        const envFinfo = await fsasync.stat(envDir).catch(e => { throw e });
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

