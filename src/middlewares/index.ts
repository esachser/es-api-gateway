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
import { addNewSchema } from '../core/schemas';

const mids: {[id:string]:IEsMiddlewareConstructor} = {};

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

    logger.info('Loading Property Middleware');
    mids['EsPropertyMiddleware'] = EsPropertyMiddlewareContructor;
    addNewSchema('EsPropertyMiddleware', EsPropertySchema);

    logger.info('Loading Metrics Middleware');
    mids['EsMetricsMiddleware'] = EsMetricsMiddlewareContructor;
    addNewSchema('EsMetricsMiddleware', EsMetricsSchema);

    logger.info('Loading Parallel Middleware');
    mids['EsParallelMiddleware'] = EsParallelMiddlewareContructor;
    addNewSchema('EsParallelMiddleware', EsParallelSchema);

    logger.info('Loading Sequence Middleware');
    mids['EsSequenceMiddleware'] = EsSequenceMiddlewareContructor;
    addNewSchema('EsSequenceMiddleware', EsSequenceSchema);

    logger.info('Loading Condition Middleware');
    mids['EsConditionMiddleware'] = EsConditionMiddlewareContructor;
    addNewSchema('EsConditionMiddleware', EsConditionSchema);
};

export function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger.info('Removing all ');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/middlewares/')).forEach(k => {
        logger.info(`Removing cache entry ${k}`);
        decache(k);
    });
};

export function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined {
    return mids[name];
}