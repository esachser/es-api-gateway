import { IEsTransport, EsParameters, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
import Router from 'koa-router';
declare type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface IEsHttpTransportParams {
    routeContext: string;
    routes: {
        [id: string]: Array<Method>;
    };
    swagger?: any;
}
declare module 'koa' {
    interface BaseContext {
        iesContext: IEsContext;
    }
}
export declare class EsHttpTransport implements IEsTransport {
    parameters: EsParameters;
    middleware: IEsMiddleware | undefined;
    routeContext: string;
    router: Router;
    /**
     *
     */
    constructor(params: IEsHttpTransportParams, middleware: IEsMiddleware | undefined);
    clear(): void;
}
export declare const EsHttpTransportContructor: IEsTranportConstructor;
export {};
