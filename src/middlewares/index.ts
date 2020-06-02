import decache from 'decache';
import fs from 'fs';
import path from 'path';
import { IEsMiddlewareConstructor } from '../core';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { EsPropertyMiddlewareContructor } from './property-middleware';
import { EsMetricsMiddlewareContructor } from './metrics-middleware';
import { EsParallelMiddlewareContructor } from './parallel-middleware';

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

    logger.info('Loading Metrics Middleware');
    mids['EsMetricsMiddleware'] = EsMetricsMiddlewareContructor;

    logger.info('Loading Parallel Middleware');
    mids['EsParallelMiddleware'] = EsParallelMiddlewareContructor;

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