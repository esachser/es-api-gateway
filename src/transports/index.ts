import decache from 'decache';
import fs from 'fs';
import path from 'path';
import { IEsTranportConstructor } from '../core';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { EsHttpTransportContructor } from './http';

const transports: {[id:string]:IEsTranportConstructor} = {};

function readDirectoryProjects(dir: string) {
    const finfos = fs.readdirSync(dir, { withFileTypes: true });

    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger.info(`Loading transport ${finfo.name}`);
            
        }
    });
}

export function loadTransports() {
    logger.info('Loading Http Tranport');
    transports['http'] = EsHttpTransportContructor;
};

export function loadCustomTransports() {
    // Limpa cache dos custom
    logger.info('Removing all transports');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/transports/')).forEach(k => {
        logger.info(`Removing cache entry ${k}`);
        decache(k);
    });
};


export function getTransportConstructor(name: string): IEsTranportConstructor | undefined {
    return transports[name];
}