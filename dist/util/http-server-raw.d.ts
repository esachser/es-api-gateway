import Router from 'find-my-way';
export declare function getHttpRouter(id: string): Router.Instance<Router.HTTPVersion.V1> | undefined;
export declare function clearRouters(): void;
export declare function loadHttpServer(conf: any): Promise<unknown>;
export declare function loadHttpServers(): Promise<void>;
