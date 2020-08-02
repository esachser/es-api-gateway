import { loadConfig, configuration } from './util/config';
import { loadMiddlewares, loadCustomMiddlewares } from './middlewares';
import { logger } from './util/logger';
import { loadTransports, loadCustomTransports } from './transports';
import { loadEnv } from './envs';
import { loadHttpServers } from './util/http-server';
import { loadJsonSchemaValidator } from './core/schemas';
import { loadAuthenticators, startAuthenticators } from './authenticators';
import { loadParsers } from './parsers';
import { getPublicCert, getPrivateKey } from './util/certs';

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

start().catch(e => {
    logger.error('General error', e);
});

