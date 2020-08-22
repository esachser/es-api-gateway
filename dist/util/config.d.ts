export interface IEsConfig {
    env: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit';
    httpPort?: number;
    authenticators?: Array<any>;
    transports?: Array<any>;
    redisLogger?: {
        enabled?: boolean;
        isCluster?: boolean;
        clusterNodes?: Array<string>;
        config?: any;
    };
    etcdConf?: any;
}
export declare let configuration: IEsConfig;
export declare function loadConfig(): Promise<void>;
