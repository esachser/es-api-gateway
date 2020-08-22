import Redis from 'ioredis';
export declare function getRedisClient(opts?: Redis.RedisOptions, isCluster?: boolean, clusterNodes?: string[]): Redis.Cluster | Redis.Redis;
