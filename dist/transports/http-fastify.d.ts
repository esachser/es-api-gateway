import { Logger } from 'winston';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware } from '../core/middlewares';
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
export declare class EsHttpTransport implements IEsTransport {
    middleware: IEsMiddleware | undefined;
    initMiddleware: IEsMiddleware | undefined;
    routeContext: string;
    static baseRoutesUsed: Map<string, Set<string>>;
    apiLogger: Logger;
    api: string;
    tid: string;
    /**
     *
     */
    constructor(params: IEsHttpTransportParams, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware);
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
