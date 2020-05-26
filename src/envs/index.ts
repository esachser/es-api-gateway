import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { IEsMiddleware, IEsTransport } from '../core';
import { getMiddlewareConstructor } from '../middlewares';
import { getTransportConstructor } from '../transports';

function createMiddleware(arr: any[], idx: number ): IEsMiddleware | undefined {
    if (idx >= arr.length) {
        return undefined;
    }

    const type = lodash.get(arr[idx], 'type');
    const data = lodash.get(arr[idx], 'data');

    const ctor = getMiddlewareConstructor(type);

    if (ctor !== undefined){
        return new ctor(data, createMiddleware(arr, idx+1));
    }
    return createMiddleware(arr, idx + 1);
}

interface IEsApi{
    transports: IEsTransport[], 
    central: IEsMiddleware | undefined;
}

let apis: {[id:string]: IEsApi} = {};

async function reloadEnv(dir: string) {
    const finfos = await fsasync.readdir(dir, { withFileTypes: true} );
    finfos.filter(f => f.isFile() && f.name.endsWith('.json')).forEach(async finfo => {
        logger.info(`Loading API ${finfo.name}`);

        const apiJson = JSON.parse((await fsasync.readFile(path.resolve(dir, finfo.name))).toString());
        
        logger.debug(apiJson);

        // Carrega Middlewares centrais.
        const executionJs = lodash.get(apiJson, 'execution') as any[];
        const centralMid = createMiddleware(executionJs, 0);

        let api: IEsApi = {
            transports: [],
            central: centralMid
        };

        const transports = lodash.get(apiJson, 'transports');

        if (transports !== undefined) {
            transports.forEach((transport: any) => {
                const type = lodash.get(transport, 'type');
                const parameters = lodash.get(transport, 'parameters');
                const preJs = lodash.get(transport, 'pre') as any[];
                const posJs = lodash.get(transport, 'pos') as any[];

                const pre = createMiddleware(preJs, 0);
                const pos = createMiddleware(posJs, 0);

                const ctor = getTransportConstructor(type);
                if (ctor !== undefined) {
                    api.transports.push(new ctor(parameters, pre, pos, centralMid));
                }
            });
        }

        apis[finfo.name] = api;
    });
}

export async function loadEnv(envName: string) {
    const envDir = path.resolve(baseDirectory, 'envs', envName);

    reloadEnv(envDir);
};