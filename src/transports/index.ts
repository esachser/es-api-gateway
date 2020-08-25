import { logger } from '../util/logger';
import { TransportContructor as EsHttpTransportContructor, TransportSchema as EsHttpTransportSchema } from './http';
import { TransportContructor as EsScheduleTransportContructor, TransportSchema as EsScheduleTransportSchema } from './schedule';
import { TransportContructor as EsRedisSubTransportContructor, TransportSchema as EsRedisSubTransportSchema } from './redissub';
import { TransportContructor as EsRedisXgroupreadTransportContructor, TransportSchema as EsRedisXgroupreadTransportSchema } from './redisxgroupread';
import { addTransport } from '../core/transports';

export function loadTransports() {
    addTransport('EsHttpTransport', EsHttpTransportContructor, EsHttpTransportSchema);
    addTransport('EsScheduleTransport', EsScheduleTransportContructor, EsScheduleTransportSchema);
    addTransport('EsRedisSubTransport', EsRedisSubTransportContructor, EsRedisSubTransportSchema);
    addTransport('EsRedisXgroupreadTransport', EsRedisXgroupreadTransportContructor, EsRedisXgroupreadTransportSchema);
};

export function loadCustomTransports() {
    // Limpa cache dos custom
    logger.info('Custom transports not implemented');
};

