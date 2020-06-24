import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { baseDirectory } from '../util';
import { logger, createLogger } from '../util/logger';
import { IEsMiddleware, IEsTransport, createMiddleware, connectMiddlewares, createTransport } from '../core';
import { httpRouter } from '../util/http-server';
import { validateObject } from '../core/schemas';
import { Logger } from 'winston';
import YAML from 'yaml';

interface IEsApi {
    transports: { [id: string]: IEsTransport },
    central: IEsMiddleware | undefined,
    logger: Logger | undefined,
}

let apis: { [id: string]: IEsApi } = {};

async function readFileToObject(fname: string) {
    const fileContents = (await fsasync.readFile(fname)).toString();
    const ext = path.extname(fname);

    if (ext === '.json') {
        return JSON.parse(fileContents);
    }
    else if (ext === '.yaml') {
        return YAML.parse(fileContents);
    }
}

async function loadApiFile(fname: string) {
    const apiJson = await readFileToObject(fname);

    logger.debug(apiJson);
    const ext = path.extname(fname);

    fname = path.basename(fname, ext);

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
    const executionJs = _.get(apiJson, 'execution') as any[];
    const centralMid = await createMiddleware(executionJs, 0);
    let logLevel = _.get(apiJson, 'logging.level', 'info');
    if (!_.isString(logLevel)) {
        logLevel = 'info';
    }

    api.central = centralMid;
    api.logger = createLogger(logLevel, fname);

    const transports = _.get(apiJson, 'transports');

    if (transports !== undefined && _.isArray(transports)) {
        for (const transport of transports) {
            const type = _.get(transport, 'type');
            const id = _.get(transport, 'id');
            const parameters = _.get(transport, 'parameters');
            const mids = _.get(transport, 'mids') as any[];

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

    finfos.filter(f => f.isFile() && (f.name.endsWith('.json') || f.name.endsWith('.yaml') )).forEach(finfo => {
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

