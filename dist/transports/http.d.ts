import { IEsTransport, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
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
    middleware: IEsMiddleware | undefined;
    routeContext: string;
    router: Router;
    static baseRoutesUsed: Set<string>;
    /**
     *
     */
    constructor(params: IEsHttpTransportParams, middleware: IEsMiddleware | undefined);
    clear(): void;
}
export declare const TransportContructor: IEsTranportConstructor;
export declare const TransportSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        routes: {
            type: string;
            additionalProperties: boolean;
            patternProperties: {
                "^\\/([a-z0-9\\-._~%!$&'()*+,;=:@/]*)$": {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
        };
        routeContext: {
            type: string;
        };
    };
};
export {};
