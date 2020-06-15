import Router from 'koa-router';
declare module 'koa' {
    interface BaseRequest {
        parsedBody?: any;
    }
}
export declare const httpRouter: Router<any, {}>;
export declare function loadHttpServer(): void;
