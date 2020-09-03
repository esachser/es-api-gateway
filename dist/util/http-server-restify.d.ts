import restify from 'restify';
export declare function getHttpRouter(id: string): restify.Server | undefined;
export declare function clearRouters(): void;
export declare function loadHttpServer(conf: any): Promise<void>;
export declare function loadHttpServers(): Promise<void>;
