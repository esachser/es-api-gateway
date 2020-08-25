import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import _, { isRegExp } from 'lodash';
import { baseDirectory, readFileToObject } from '../util';
import { logger, createLogger } from '../util/logger';
import { validateObject } from '../core/schemas';
import { Logger } from 'winston';
import { load } from '@grpc/grpc-js';
import { configuration } from '../util/config';
import { clearRouters } from '../util/http-server';
import { IEsTransport, createTransport } from '../core/transports';
import { createMiddleware, connectMiddlewares } from '../core/middlewares';

interface IEsApi {
    transports: { [id: string]: IEsTransport },
    logger: Logger | undefined,
    apiFile: string
}

let apis: { [id: string]: IEsApi } = {};

async function loadApiFile(fname: string) {
    const apiJson = await readFileToObject(fname);

    logger.debug(apiJson);
    const ext = path.extname(fname);

    fname = path.basename(fname, ext);

    let api: IEsApi = apis[fname] ?? {
        transports: [],
        logger: {},
        apiFile: `${fname}${ext}`
    };

    delete apis[fname];

    for (const tname of Object.keys(api.transports)) {
        if (api.transports[tname] !== undefined) {
            api.transports[tname].clear();
            api.logger?.close();
            delete api.logger;
            delete api.transports[tname];
        }
    }

    if (!(await validateObject('es-api', apiJson))) {
        return;
    }

    // Carrega Middlewares iniciais.
    const initJs = _.get(apiJson, 'init', []) as any[];

    // Carrega Middlewares centrais.
    const executionJs = _.get(apiJson, 'execution') as any[];
    let logLevel = _.get(apiJson, 'logging.level', 'info');
    if (!_.isString(logLevel)) {
        logLevel = 'info';
    }
    api.logger = createLogger(logLevel, fname);

    const transports = _.get(apiJson, 'transports');

    const apiEnabled = _.get(apiJson, 'enabled', true);

    if (transports !== undefined && _.isArray(transports)) {
        for (const transport of transports) {
            const trpEnabled = _.get(transport, 'enabled', true);
            if (apiEnabled && trpEnabled) {
                const initialMid = await createMiddleware(initJs, 0, fname);
                const centralMid = await createMiddleware(executionJs, 0, fname);

                const id = _.get(transport, 'id');
                const type = _.get(transport, 'type');
                const parameters = _.get(transport, 'parameters');
                const mids = _.get(transport, 'mids') as any[];

                const pre = await createMiddleware(mids, 0, fname);
                const mid = connectMiddlewares(pre, centralMid);

                const trp = await createTransport(type, fname, id, api.logger, parameters, mid, initialMid);
                if (trp !== undefined) {
                    api.transports[id] = trp;
                }
            }
        }
    }

    apis[fname] = api;
}

async function reloadEnv(dir: string) {
    const finfos = await fsasync.readdir(dir, { withFileTypes: true });

    finfos.filter(f => f.isFile() && (f.name.endsWith('.json') || f.name.endsWith('.yaml') )).forEach(finfo => {
        logger.info(`Loading API ${finfo.name}`);

        loadApiFile(path.resolve(dir, finfo.name)).catch(e => {
            logger.error(`Error loading file ${finfo.name}`, e);
        });
    });
}

let watcher: fs.FSWatcher | undefined = undefined;

export async function reloadApi(apiName: string) {
    const apiJson = path.resolve(baseDirectory, 'envs', configuration.env, `${apiName}.json`);
    const apiYaml = path.resolve(baseDirectory, 'envs', configuration.env, `${apiName}.yaml`);
    if (fs.existsSync(apiJson)) {
        return loadApiFile(apiJson);
    }
    else if (fs.existsSync(apiYaml)) {
        return loadApiFile(apiYaml);
    }
}

export async function loadEnv(envName: string) {
    const envDir = path.resolve(baseDirectory, 'envs', envName);

    const envDirExists = fs.existsSync(envDir);

    if (watcher !== undefined) {
        watcher.close();
        clearRouters();
    }

    if (envDirExists) {
        const envFinfo = await fsasync.stat(envDir);
        if (envFinfo.isDirectory()) {
            reloadEnv(envDir);
            watcher = fs.watch(envDir, (ev, fname) => {
                if (fname.endsWith('.json') || fname.endsWith('.yaml')) {
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

