import Router from 'koa-router';
export declare function getHttpRouter(id: string): Router<any, {}> | undefined;
export declare function clearRouters(): void;
export declare function loadHttpServer(conf: any): Promise<unknown>;
export declare function loadHttpServers(): Promise<void>;
