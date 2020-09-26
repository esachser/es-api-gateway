import { loadConfig, configuration, loadMasterWatcher } from './util/config';
import { loadMiddlewares, loadCustomMiddlewares } from './middlewares';
import { logger } from './util/logger';
import { loadTransports, loadCustomTransports } from './transports';
import { loadEnv, masterLoadApiWatcher } from './envs';
import { loadHttpServers } from './util/http-server';
import { loadJsonSchemaValidator } from './core/schemas';
import { loadAuthenticators, startAuthenticators } from './authenticators';
import { loadParsers } from './parsers';

process.on('uncaughtException', err => {
    logger.error('Uncaught exception happened', err);
});

process.on('unhandledRejection', err => {
    logger.error('Unhandled Rejection on promise', err);
});

async function start() {
    await createEtcd();
    await loadConfig();
    loadParsers();
    await loadMiddlewares();
    await loadCustomMiddlewares()
        .catch(err => {
            logger.error('Error loading compound middlewares', err);
        });
    loadTransports();
    loadCustomTransports();
    loadAuthenticators();
    await loadHttpServers();
    loadJsonSchemaValidator();
    await loadDatabaseConnections();
    await startAuthenticators();
    await loadEnv(configuration.env);
    //await delay(10000).then(runServers);
}

// Cluster start
import cluster from 'cluster';
import os from 'os';
import { RateLimiterClusterMaster } from 'rate-limiter-flexible';
import { setIdScheduler } from './transports/schedule';
import { setIdSub } from './transports/redissub';
import _ from 'lodash';
import getEtcdClient, { createEtcd } from './util/etdc';
import { masterLoadResourcesWatcher } from './util/sync-resources';
import { masterLoadCustomWatcher } from './util/sync-custom';
import { delay } from './util';
import { loadDatabaseConnections } from './util/dbKnex';

let numCpus = os.cpus().length;

try {
    if (process.env['NUM_PROCS'] !== undefined) {
        numCpus = parseInt(process.env['NUM_PROCS']);
    }
    if (numCpus <= 0) {
        numCpus = 1;
    }
    if (isNaN(numCpus)) {
        numCpus = 1;
    }
}
finally {
    logger.info(`Using ${numCpus} processes`);
}

if (cluster.isMaster) {
    new RateLimiterClusterMaster();

    cluster.on('exit', (worker, code, signal) => {
        logger.info(`worker ${worker.process.pid} died`);
        if (checkAnyWorking()) {
            setIdToSchedule();
        }
        else {
            logger.info('No client running, exiting');
            process.exit(0);
        }
    });

    function checkAnyWorking() {
        for (const id in cluster.workers) {
            if (cluster.workers[id]?.isConnected()) {
                return true;
            }
        }
        return false;
    }

    function setIdToSchedule() {
        let fid = undefined;
        for (const id in cluster.workers) {
            if (cluster.workers[id]?.isConnected()) {
                fid = fid ?? cluster.workers[id]?.id;
                cluster.workers[id]?.send({type: 'SET_ID_SCHEDULER', data:fid});
            }
        }
    }

    createEtcd()
        .then(async () => {
            await loadConfig();
            await loadMasterWatcher();
            await masterLoadApiWatcher(configuration.env);
            await masterLoadResourcesWatcher(configuration.env);
            await masterLoadCustomWatcher();
            for (let i = 0; i < numCpus; i++) {
                cluster.fork();
            }
            setIdToSchedule();
        })
        .catch(err => {
            logger.error('Error staring leader', err);
        });
}
else {
    start().catch(e => {
        logger.error('General error', e);
    });
    logger.info(`Worker ${cluster.worker.id} on pid ${cluster.worker.process.pid} running.`);

    process.on('message', (msg: {type: string, data:any}) => {
        switch(msg.type) {
            case 'SET_ID_SCHEDULER': 
                setIdScheduler(msg.data);
                setIdSub(msg.data);
            break;
        }
    });
}

