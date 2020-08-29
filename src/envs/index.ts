import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import cluster from 'cluster';
import _ from 'lodash';
import { baseDirectory, readFileToObject } from '../util';
import { logger, createLogger } from '../util/logger';
import { validateObject } from '../core/schemas';
import { Logger } from 'winston';
import { configuration } from '../util/config';
import { clearRouters } from '../util/http-server';
import { IEsTransport, createTransport } from '../core/transports';
import { createMiddleware, connectMiddlewares } from '../core/middlewares';
import getEtcdClient from '../util/etdc';
import { Watcher } from 'etcd3';

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

// async function reloadEnv(dir: string) {
//     const finfos = await fsasync.readdir(dir, { withFileTypes: true });

//     finfos.filter(f => f.isFile() && (f.name.endsWith('.json') || f.name.endsWith('.yaml') )).forEach(finfo => {
//         logger.info(`Loading API ${finfo.name}`);

//         loadApiFile(path.resolve(dir, finfo.name)).catch(e => {
//             logger.error(`Error loading file ${finfo.name}`, e);
//         });
//     });
// }

let watcher: chokidar.FSWatcher;

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
            //reloadEnv(envDir);
            watcher = chokidar.watch(envDir).on('all', (ev, fname) => {
                if (ev === 'addDir') return;
                if (fname.endsWith('.json') || fname.endsWith('.yaml')) {
                    logger.info(`Reloading ${path.basename(fname)}.`);
                    loadApiFile(fname).catch(err => {
                        logger.error(`Error reloading file ${fname}.`, err);
                    });
                }
            });
        }
    }
};

// ======== MASTER FUNCTIONS ==================

let masterEtcdWatcher: Watcher;
let masterFileWatcher: chokidar.FSWatcher;
let apiStatuses: { [index: string]: 'local_changed' | 'local_deleted' | 'etcd_changed' | 'etcd_deleted' } = {};
export async function masterLoadApiWatcher(envName: string) {
    if (!cluster.isMaster) return;

    
    apiStatuses = {};
    const envDir = path.resolve(baseDirectory, 'envs', envName);
    await fsasync.mkdir(envDir, { recursive: true });

    // Configura o watcher de API
    if (masterEtcdWatcher !== undefined) {
        await masterEtcdWatcher.cancel();
    }
    masterEtcdWatcher = await getEtcdClient().watch().prefix(`esgateway/envs/${envName}/apis/`).create();
    masterEtcdWatcher.on('put', async kv => {
        try {
            const basename = path.basename(kv.key.toString('utf8'));
            const status = apiStatuses[basename] ?? '';
            if (status !== 'local_changed') {
                logger.info(`Receiving update (ETCD --> Local) from api ${basename}`);
                const fname = path.resolve(envDir, basename);

                apiStatuses[basename] = 'etcd_changed';
                await fsasync.writeFile(fname, kv.value);
            }
            else {
                delete apiStatuses[basename];
            }
        }
        catch (err) {
            logger.error('Error adding/updating API', err);
        }
    });
    masterEtcdWatcher.on('delete', async kv => {
        try {
            const basename = path.basename(kv.key.toString('utf8'));
            const status = apiStatuses[basename] ?? '';
            if (status !== 'local_deleted') {
                logger.info(`Receiving delete (ETCD --> Local) from api ${basename}`);
                const fname = path.resolve(envDir, basename);

                if (fs.existsSync(fname)) {
                    apiStatuses[basename] = 'etcd_deleted';
                    await fsasync.unlink(fname);
                }
            }
            else {
                delete apiStatuses[basename];
            }
        }
        catch (err) {
            logger.error('Error deleting API', err);
        }
    });

    // Terá que carregar todas as APIs antes.
    // TODO: Carregar as APIs do ETCD primeiro, e depois deixar o watcher atualizar
    const etcdApis = await getEtcdClient().getAll().prefix(`esgateway/envs/${envName}/apis/`);
    for (const key in etcdApis) {
        const basename = path.basename(key);
        const value = etcdApis[key];

        apiStatuses[basename] = 'etcd_changed';
        const fname = path.resolve(envDir, basename);
        await fsasync.writeFile(fname, value);
    }
    
    // Carrega o file watcher
    async function masterUpdateApi(fname: string) {
        const basename = path.basename(fname);
        const status = apiStatuses[basename] ?? '';
        if (status !== 'etcd_changed') {
            logger.info(`Sending update (local --> ETCD) from api ${basename}`);
            apiStatuses[basename] = 'local_changed';
            const key = `esgateway/envs/${envName}/apis/${basename}`;
            const value = await fsasync.readFile(fname);
            await getEtcdClient().put(key).value(value);
        }
        else {
            delete apiStatuses[basename];
        }
    }
    
    async function masterDeleteApi(fname: string) {
        const basename = path.basename(fname);
        const status = apiStatuses[basename] ?? '';
        if (status !== 'etcd_deleted') {
            logger.info(`Sending delete (local --> ETCD) from api ${basename}`);
            apiStatuses[basename] = 'local_deleted';
            const key = `esgateway/envs/${envName}/apis/${basename}`;
            await getEtcdClient().delete().key(key);
        }
        else {
            delete apiStatuses[basename];
        }
    }
    if (masterFileWatcher !== undefined) {
        await masterFileWatcher.close();
    }
    masterFileWatcher = chokidar.watch(envDir)
        .on('add', masterUpdateApi)
        .on('change', masterUpdateApi)
        .on('unlink', masterDeleteApi);
}

