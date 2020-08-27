export interface IEsConfig {
    env: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit';
    authenticators?: Array<any>;
    transports?: Array<any>;
    redisLogger?: {
        enabled?: boolean;
        isCluster?: boolean;
        clusterNodes?: Array<string>;
        config?: any;
    };
}
export declare let configuration: IEsConfig;
export declare function loadConfig(): Promise<void>;
export declare function loadMasterWatcher(): Promise<void>;
