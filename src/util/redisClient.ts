import Redis from 'ioredis';
import { logger } from './logger';

export function getRedisClient(opts:Redis.RedisOptions = {}, isCluster = false, clusterNodes:string[] = []) {
    const client = isCluster ? 
        new Redis.Cluster(clusterNodes, {
            ...opts,
            lazyConnect: true
        }) :
        new Redis({
            ...opts,
            lazyConnect: true
        });
    client.on('error', err => {
        logger.error('Error on Redis client', err);
    });
    return client;
}
