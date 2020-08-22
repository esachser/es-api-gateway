import { loadConfig, configuration } from './util/config';
import { loadMiddlewares, loadCustomMiddlewares } from './middlewares';
import { logger } from './util/logger';
import { loadTransports, loadCustomTransports } from './transports';
import { loadEnv } from './envs';
import { loadHttpServers } from './util/http-server';
import { loadJsonSchemaValidator } from './core/schemas';
import { loadAuthenticators, startAuthenticators } from './authenticators';
import { loadParsers } from './parsers';

process.on('uncaughtException', err => {
    logger.error('Excecaooooo', err);
});

process.on('unhandledRejection', err => {
    logger.error('REJEICAO', err);
});

async function start() {
    await loadConfig();
    loadParsers();
    loadMiddlewares();
    await loadCustomMiddlewares();
    loadTransports();
    loadCustomTransports();
    loadAuthenticators();
    await loadHttpServers();
    loadJsonSchemaValidator();
    await startAuthenticators();
    await loadEnv(configuration.env);
}

// Cluster start
import cluster from 'cluster';
import os from 'os';
import { RateLimiterClusterMaster } from 'rate-limiter-flexible';
import { setIdScheduler } from './transports/schedule';
import { setIdSub } from './transports/redissub';
import _, { stubFalse } from 'lodash';

let numCpus = os.cpus().length;

try {
    if (process.env['NUM_PROCS'] !== undefined) {
        numCpus = parseInt(process.env['NUM_PROCS']);
    }
    if (numCpus <= 0) {
        numCpus = 1;
    }
}
catch(err) {
    logger.info(`Using ${numCpus} processes`);
}

if (cluster.isMaster) {
    new RateLimiterClusterMaster();
    for (let i = 0; i < numCpus; i++) {
        cluster.fork();
    }

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

    setIdToSchedule();
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

