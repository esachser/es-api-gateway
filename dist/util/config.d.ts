export interface IEsConfig {
    env: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'crit';
    httpPort?: number;
    authenticators?: Array<any>;
    transports?: Array<any>;
}
export declare let configuration: IEsConfig;
export declare function loadConfig(): Promise<void>;
