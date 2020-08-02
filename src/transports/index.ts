import decache from 'decache';
import fs from 'fs';
import path from 'path';
import { IEsTranportConstructor } from '../core';
import { baseDirectory } from '../util';
import { logger } from '../util/logger';
import { TransportContructor as EsHttpTransportContructor, TransportSchema as EsHttpTransportSchema } from './http';
import { TransportContructor as EsScheduleTransportContructor, TransportSchema as EsScheduleTransportSchema } from './schedule';
import { addNewSchema } from '../core/schemas';
import { addTransport } from '../core/transports';


function readDirectoryProjects(dir: string) {
    const finfos = fs.readdirSync(dir, { withFileTypes: true });

    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger.info(`Loading transport ${finfo.name}`);
        }
    });
}

export function loadTransports() {
    addTransport('EsHttpTransport', EsHttpTransportContructor, EsHttpTransportSchema);
    addTransport('EsScheduleTransport', EsScheduleTransportContructor, EsScheduleTransportSchema);
};

export function loadCustomTransports() {
    // Limpa cache dos custom
    logger.info('Removing all transports');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/transports/')).forEach(k => {
        logger.info(`Removing cache entry ${k}`);
        decache(k);
    });
};

