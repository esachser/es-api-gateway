import { loadConfig, configuration } from './util/config';
import { loadMiddlewares, loadCustomMiddlewares } from './middlewares';
import { logger } from './util/logger';
import { loadTransports, loadCustomTransports } from './transports';
import { loadEnv } from './envs';
import { loadHttpServer } from './util/http-server';
import { loadJsonSchemaValidator } from './core/schemas';

async function start() {
    await loadConfig().catch(e => { throw e });
    loadMiddlewares();
    loadCustomMiddlewares();
    loadTransports();
    loadCustomTransports();
    loadHttpServer();
    loadJsonSchemaValidator();
    await loadEnv(configuration.env).catch(e => { throw e });
}

start().catch(e => {
    logger.error('General error', e);
});

