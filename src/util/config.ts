import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { baseDirectory } from '.';
import { logger } from './logger';
import { loadEnv } from '../envs';
import { startAuthenticators } from '../authenticators';
import { loadHttpServers } from './http-server';

export interface IEsConfig {
    env: string,
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit',
    httpPort?: number,
    authenticators?: Array<any>,
    transports?: Array<any>
};

export let configuration: IEsConfig = { env: 'local' };

const configFileName = path.resolve(baseDirectory, 'conf', 'global.json');

export async function loadConfig() {
    logger.info('Reloading global config file');
    const text = await fsasync.readFile(configFileName);
    configuration = JSON.parse(text.toString()) as IEsConfig;
    logger.level = configuration.logLevel || 'info';
}

fs.watch(configFileName, async (event, fname) => {
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
});
