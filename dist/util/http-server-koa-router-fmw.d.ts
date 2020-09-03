import router from 'koa-router-find-my-way';
export declare function getHttpRouter(id: string): router.Instance | undefined;
export declare function clearRouters(): void;
export declare function loadHttpServer(conf: any): Promise<unknown>;
export declare function loadHttpServers(): Promise<void>;
