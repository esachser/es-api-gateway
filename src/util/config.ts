import fsasync from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { baseDirectory } from '.';
import { logger } from './logger';
import { loadEnv } from '../envs';

export interface IEsConfig {
    env: string,
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit',
    httpPort?: number
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
    await loadConfig();
    await loadEnv(configuration.env);
});
