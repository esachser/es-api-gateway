import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { baseDirectory } from '.';
import { logger } from './logger';
import { loadEnv } from '../envs';
import { startAuthenticators } from '../authenticators';
import { loadHttpServers } from './http-server';
import cluster from 'cluster';
import { Watcher } from 'etcd3';
import getEtcdClient from './etdc';

export interface IEsConfig {
    env: string,
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit',
    authenticators?: Array<any>,
    transports?: Array<any>,
    redisLogger?: { enabled?: boolean, isCluster?: boolean, clusterNodes?: Array<string>, config?: any }
};

export let configuration: IEsConfig = { env: 'local' };

const configFileName = path.resolve(baseDirectory, 'conf', 'global.json');

const DEFAULT_CONFIG: IEsConfig = {
    env: 'default',
    transports: [
        {
            type: 'http',
            port: 4000,
            id: 'http'
        }
    ]
}

function masterProcessNewConfig() {
    if (!cluster.isMaster) return;
    setImmediate(async () => {
        try {
            if (fs.existsSync(configFileName) && actual_version !== 'cancel') {
                if (actual_version === 'no_version') {
                    logger.info('Updating ETCD Global config');
                    actual_version = 'this';
                    const client = getEtcdClient();
                    await loadConfig();
                    const r = await client
                        .if(ETCD_GLOBAL_CONFIG_KEY, 'Version', '!==', actual_version)
                        .then(client.put(ETCD_GLOBAL_CONFIG_KEY).value(JSON.stringify(configuration, undefined, 2)))
                        .commit();
                }
                else {
                    actual_version = 'no_version';
                }
            }
            else {
                actual_version = 'no_version';
            }
        }
        catch (err) {
            logger.error('Error writing new configuration', err);
        }
    });
}

let watcher: chokidar.FSWatcher;
let loading = false;
export async function loadConfig() {
    logger.info('Reloading global config file');

    if (!fs.existsSync(configFileName)) {
        await fsasync.mkdir(path.dirname(configFileName), { recursive: true });
        const cfg = await getEtcdClient().get(ETCD_GLOBAL_CONFIG_KEY).json();
        actual_version = 'cancel';
        if (cfg !== null) {
            await fsasync.writeFile(configFileName, JSON.stringify(cfg, undefined, 2));
        }
        else {
            await fsasync.writeFile(configFileName, JSON.stringify(DEFAULT_CONFIG));
        }
    }

    const text = await fsasync.readFile(configFileName);
    try {
        configuration = JSON.parse(text.toString()) as IEsConfig;
    }
    catch {
        configuration = DEFAULT_CONFIG;
    }
    logger.level = configuration.logLevel || 'info';

    if (cluster.isWorker && watcher === undefined) {
        const reloadConfig = async () => {
            if (loading) {
                return;
            }
            loading = true;
            await loadConfig().catch(e => {
                logger.error('Error loading config', e);
            });
            await startAuthenticators().catch(e => {
                logger.error('Error starting authenticators', e);
            });
            await loadHttpServers().catch(e => {
                logger.error('Error loading HTTP Transports', e);
            });
            await loadEnv(configuration.env).catch(e => {
                logger.error('Error loading APIs', e);
            });
            loading = false;
        };
        watcher = chokidar.watch(configFileName).on('change', reloadConfig);
        watcher.on('unlink', reloadConfig);
    }
    else if (cluster.isMaster && watcher === undefined) {
        watcher = chokidar.watch(configFileName).on('change', masterProcessNewConfig);
        watcher.on('unlink', masterProcessNewConfig);
    }
}

let masterWatcher: Watcher;
let actual_version: string = 'no_version';
const ETCD_GLOBAL_CONFIG_KEY = 'esgateway/global.json';
export async function loadMasterWatcher() {
    if (cluster.isMaster) {
        const client = getEtcdClient();

        if (configuration === undefined) await loadConfig();

        await client
            .if(ETCD_GLOBAL_CONFIG_KEY, 'Create', '==', 0)
            .then(client.put(ETCD_GLOBAL_CONFIG_KEY).value(JSON.stringify(configuration, undefined, 2)))
            .commit();

        const cfg = await client.get(ETCD_GLOBAL_CONFIG_KEY).json();
        if (cfg !== null) {
            actual_version = 'cancel';
            await fsasync.writeFile(configFileName, JSON.stringify(cfg, undefined, 2));
        }

        if (masterWatcher !== undefined) {
            await masterWatcher.cancel();
        }
        masterWatcher = await client.watch().key(ETCD_GLOBAL_CONFIG_KEY).create();
        masterWatcher.on('put', async res => {
            try {
                if (actual_version !== 'this') {
                    actual_version = res.version;
                    await fsasync.writeFile(configFileName, res.value);
                }
                else {
                    actual_version = 'no_version';
                }
            }
            catch (err) {
                logger.error('Error reloading configuration from Etcd', err);
            }
        });
    }
}

