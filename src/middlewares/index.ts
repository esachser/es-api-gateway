import decache from 'decache';
import fs from 'fs';
import path from 'path';
import { IEsMiddlewareConstructor } from '../core';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { MiddlewareCtor as EsPropertyMiddlewareContructor, MiddlewareSchema as EsPropertySchema } from './property-middleware';
import { MiddlewareCtor as EsMetricsMiddlewareContructor, MiddlewareSchema as EsMetricsSchema } from './metrics-middleware';
import { MiddlewareCtor as EsParallelMiddlewareContructor, MiddlewareSchema as EsParallelSchema } from './parallel-middleware';
import { MiddlewareCtor as EsSequenceMiddlewareContructor, MiddlewareSchema as EsSequenceSchema } from './sequence-middleware';
import { MiddlewareCtor as EsConditionMiddlewareContructor, MiddlewareSchema as EsConditionSchema } from './condition-middleware';
import { MiddlewareCtor as EsHttpRequestMiddlewareContructor, MiddlewareSchema as EsHttpRequestSchema } from './httprequest-middleware';
import { MiddlewareCtor as EsOpenApiVerifyMiddlewareContructor, MiddlewareSchema as EsOpenApiVerifySchema } from './openapiverify-middleware';
import { MiddlewareCtor as EsThrowMiddlewareContructor, MiddlewareSchema as EsThrowSchema } from './throw-middleware';
import { MiddlewareCtor as EsCatchMiddlewareContructor, MiddlewareSchema as EsCatchSchema } from './catch-middleware';
import { MiddlewareCtor as EsAuthenticateMiddlewareContructor, MiddlewareSchema as EsAuthenticateSchema } from './authenticate-middleware';
import { MiddlewareCtor as EsExecJsMiddlewareContructor, MiddlewareSchema as EsExecJsSchema } from './execjs-middleware';
import { addMiddleware } from '../core/middlewares';

function readDirectoryProjects(dir: string) {
    const finfos = fs.readdirSync(dir, { withFileTypes: true });

    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger.info(`Loading middleware ${finfo.name}`);
            
        }
    });
}

export function loadMiddlewares() {
    //readDirectoryProjects(path.resolve(baseDirectory, 'middlewares'));
    addMiddleware('EsPropertyMiddleware', EsPropertyMiddlewareContructor, EsPropertySchema);
    addMiddleware('EsMetricsMiddleware', EsMetricsMiddlewareContructor, EsMetricsSchema);
    addMiddleware('EsParallelMiddleware', EsParallelMiddlewareContructor, EsParallelSchema);
    addMiddleware('EsSequenceMiddleware', EsSequenceMiddlewareContructor, EsSequenceSchema);
    addMiddleware('EsConditionMiddleware', EsConditionMiddlewareContructor, EsConditionSchema);
    addMiddleware('EsHttpRequestMiddleware', EsHttpRequestMiddlewareContructor, EsHttpRequestSchema);
    addMiddleware('EsOpenApiVerifyMiddleware', EsOpenApiVerifyMiddlewareContructor, EsOpenApiVerifySchema);
    addMiddleware('EsThrowMiddleware', EsThrowMiddlewareContructor, EsThrowSchema);
    addMiddleware('EsCatchMiddleware', EsCatchMiddlewareContructor, EsCatchSchema);
    addMiddleware('EsAuthenticateMiddleware', EsAuthenticateMiddlewareContructor, EsAuthenticateSchema);
    addMiddleware('EsExecJsMiddleware', EsExecJsMiddlewareContructor, EsExecJsSchema);
};

export function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger.info('Removing all custom middlewares');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/middlewares/')).forEach(k => {
        logger.info(`Removing cache entry ${k}`);
        decache(k);
    });
};