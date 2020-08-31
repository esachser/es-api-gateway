// ======== MASTER FUNCTIONS ==================

import { Watcher } from "etcd3";
import chokidar from 'chokidar';
import cluster from 'cluster';
import path from 'path';
import fs from 'fs';
import fsasync from 'fs/promises';
import getEtcdClient from "./etdc";
import { baseDirectory } from ".";
import { logger } from "./logger";

let masterEtcdWatcher: Watcher;
let masterFileWatcher: chokidar.FSWatcher;
let resourcesStatuses: { [index: string]: 'local_changed' | 'local_deleted' | 'etcd_changed' | 'etcd_deleted' } = {};
export async function masterLoadResourcesWatcher(envName: string) {
    if (!cluster.isMaster) return;

    resourcesStatuses = {};
    const envDir = path.resolve(baseDirectory, 'resources', envName);
    await fsasync.mkdir(envDir, { recursive: true });

    const etcdDir = `esgateway/envs/${envName}/resources`;

    // Configura o watcher de API
    if (masterEtcdWatcher !== undefined) {
        await masterEtcdWatcher.cancel();
    }
    masterEtcdWatcher = await getEtcdClient().watch().prefix(etcdDir).create();
    masterEtcdWatcher.on('put', async kv => {
        try {
            const basename = kv.key.toString('utf8').replace(etcdDir, '');
            const status = resourcesStatuses[basename] ?? '';
            if (status !== 'local_changed') {
                logger.info(`Receiving update (ETCD --> Local) from resource ${basename}`);
                const fname = path.resolve(envDir, ...basename.split('/'));

                resourcesStatuses[basename] = 'etcd_changed';
                const fdir = path.dirname(fname);
                await fsasync.mkdir(fdir, { recursive: true });
                await fsasync.writeFile(fname, kv.value);
            }
            else {
                delete resourcesStatuses[basename];
            }
        }
        catch (err) {
            logger.error('Error adding/updating API', err);
        }
    });
    masterEtcdWatcher.on('delete', async kv => {
        try {
            const basename = kv.key.toString('utf8').replace(etcdDir, '');
            const status = resourcesStatuses[basename] ?? '';
            if (status !== 'local_deleted') {
                logger.info(`Receiving delete (ETCD --> Local) from resource ${basename}`);
                const fname = path.resolve(envDir, ...basename.split('/'));

                if (fs.existsSync(fname)) {
                    resourcesStatuses[basename] = 'etcd_deleted';
                    await fsasync.unlink(fname);
                }
            }
            else {
                delete resourcesStatuses[basename];
            }
        }
        catch (err) {
            logger.error('Error deleting API', err);
        }
    });

    // Terá que carregar todas as APIs antes.
    // TODO: Carregar as APIs do ETCD primeiro, e depois deixar o watcher atualizar
    const etcdResources = await getEtcdClient().getAll().prefix(etcdDir);
    for (const key in etcdResources) {
        const basename = key.replace(etcdDir, '');
        const value = etcdResources[key];

        resourcesStatuses[basename] = 'etcd_changed';
        const fname = path.resolve(envDir, basename);
        await fsasync.writeFile(fname, value);
    }
    
    // Carrega o file watcher
    async function masterUpdateApi(fname: string) {
        const basename = fname.replace(envDir, '');
        const status = resourcesStatuses[basename] ?? '';
        if (status !== 'etcd_changed') {
            logger.info(`Sending update (local --> ETCD) from resource ${basename}`);
            resourcesStatuses[basename] = 'local_changed';
            const key = `${etcdDir}${basename.split(path.sep).join('/')}`;
            const value = await fsasync.readFile(fname);
            await getEtcdClient().put(key).value(value);
        }
        else {
            delete resourcesStatuses[basename];
        }
    }
    
    async function masterDeleteApi(fname: string) {
        const basename = fname.replace(envDir, '');
        const status = resourcesStatuses[basename] ?? '';
        if (status !== 'etcd_deleted') {
            logger.info(`Sending delete (local --> ETCD) from resource ${basename}`);
            resourcesStatuses[basename] = 'local_deleted';
            const key = `${etcdDir}${basename.split(path.sep).join('/')}`;
            await getEtcdClient().delete().key(key);
        }
        else {
            delete resourcesStatuses[basename];
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
