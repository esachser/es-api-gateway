import { Etcd3 } from 'etcd3';
import fs from 'fs';
import path from 'path';
import { baseDirectory } from '.';
import { logger } from './logger';
import { loadMasterWatcher } from './config';

const ETCD_CONF_PATH = path.resolve(baseDirectory, 'conf', 'etcd.json');

let ETCD_CLIENT: Etcd3;
// Lê configuração de arquivo no conf
export async function createEtcd() {
    try {
        if (!fs.existsSync(ETCD_CONF_PATH)) {
            fs.writeFileSync(ETCD_CONF_PATH, JSON.stringify({ hosts: 'http://localhost:2379' }));
        }
        const cfg = JSON.parse(fs.readFileSync(ETCD_CONF_PATH, { encoding: 'utf-8' }));
        ETCD_CLIENT = new Etcd3(cfg);
        loadMasterWatcher();
    }
    catch (err) {
        logger.error('Error loading ETCD', err);
        ETCD_CLIENT = new Etcd3();
    }
}

fs.watch(ETCD_CONF_PATH, async () => {
    try {
        ETCD_CLIENT.close();
        createEtcd();
    }
    catch (err) {
        logger.error('Error loading ETCD', err);
        ETCD_CLIENT = new Etcd3();
    }
});

export default function getEtcdClient() {
    return ETCD_CLIENT;
};