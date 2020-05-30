import { loadConfig, configuration } from './util/config';
import { loadMiddlewares, loadCustomMiddlewares } from './middlewares';
import { logger } from './util/logger';
import { loadTransports, loadCustomTransports } from './transports';
import { loadEnv } from './envs';
import { loadHttpServer } from './util/http-server';

async function start() {
    await loadConfig();
    loadMiddlewares();
    loadCustomMiddlewares();
    loadTransports();
    loadCustomTransports();
    loadHttpServer();
    await loadEnv(configuration.env);
}

start().catch(e => {
    logger.error(e);
});

