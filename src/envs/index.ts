import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { IEsMiddleware, IEsTransport } from '../core';
import { getMiddlewareConstructor } from '../middlewares';
import { getTransportConstructor } from '../transports';
import { httpRouter } from '../util/http-server';

function createMiddleware(arr: any[], idx: number): IEsMiddleware | undefined {
    if (idx >= arr.length) {
        return undefined;
    }

    const type = lodash.get(arr[idx], 'type');
    const data = lodash.get(arr[idx], 'data');

    const ctor = getMiddlewareConstructor(type);

    if (ctor !== undefined) {
        return new ctor(data, createMiddleware(arr, idx + 1));
    }
    return createMiddleware(arr, idx + 1);
}

function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware) {
    let mid = mid1;

    while (mid.next !== undefined) mid = mid.next;

    mid.next = mid2;
}

function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]) {
    let mid = undefined;

    if (middlewares.length > 0) {

        mid = middlewares[0];

        let i = 1;

        while (mid === undefined) {
            mid = middlewares[i];
            i++;
        }

        for (; i < middlewares.length; i++) {
            let md = middlewares[i];
            if (md !== undefined) {
                connect2Mids(mid, md);
            }
        }
    }

    return mid;
}

interface IEsApi {
    transports: { [id: string]: IEsTransport },
    central: IEsMiddleware | undefined;
}

let apis: { [id: string]: IEsApi } = {};

async function loadApiFile(fname: string) {
    const apiJson = JSON.parse((await fsasync.readFile(fname)).toString());

    logger.debug(apiJson);

    // Carrega Middlewares centrais.
    const executionJs = lodash.get(apiJson, 'execution') as any[];
    const centralMid = createMiddleware(executionJs, 0);

    let api: IEsApi = apis[fname] || {
        transports: [],
        central: centralMid
    };

    const transports = lodash.get(apiJson, 'transports');

    if (transports !== undefined) {
        transports.forEach((transport: any) => {
            const type = lodash.get(transport, 'type');
            const id = lodash.get(transport, 'id');
            const parameters = lodash.get(transport, 'parameters');
            const mids = lodash.get(transport, 'mids') as any[];

            const pre = createMiddleware(mids, 0);

            const mid = connectMiddlewares(pre, centralMid);

            const ctor = getTransportConstructor(type);
            if (ctor !== undefined) {
                if (api.transports[id] !== undefined) {
                    api.transports[id].clear();
                }
                api.transports[id] = new ctor(parameters, mid);
            }
        });
    }

    apis[fname] = api;
}

async function reloadEnv(dir: string) {
    const finfos = await fsasync.readdir(dir, { withFileTypes: true });

    finfos.filter(f => f.isFile() && f.name.endsWith('.json')).forEach(async finfo => {
        logger.info(`Loading API ${finfo.name}`);

        await loadApiFile(path.resolve(dir, finfo.name));
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
                    loadApiFile(path.resolve(envDir, fname));
                }
            });
        }
    }
};

