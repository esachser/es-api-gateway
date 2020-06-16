import { IEsTransport, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
import Router from 'koa-router';
import { Logger } from 'winston';
declare type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface IEsHttpTransportParams {
    routeContext: string;
    routes: {
        [id: string]: Array<{
            method: Method;
            mids: Array<any>;
        }>;
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
    apiLogger: Logger;
    /**
     *
     */
    constructor(params: IEsHttpTransportParams, api: string, apiLogger: Logger, middleware: IEsMiddleware | undefined);
    loadAsync(params: IEsHttpTransportParams): Promise<void>;
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
                        properties: {
                            method: {
                                type: string;
                                enum: string[];
                            };
                            mids: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                        };
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
