import { IEsTransport, IEsMiddleware, IEsTranportConstructor } from '../core';
import { Logger } from 'winston';
export declare function setIdSub(id: number): void;
export declare class EsRedisSubTransport implements IEsTransport {
    middleware: IEsMiddleware | undefined;
    apiLogger: Logger;
    api: string;
    tid: string;
    private _redis;
    private _subStr;
    /**
     *
     */
    constructor(params: any, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware);
    loadAsync(params: any): Promise<void>;
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
        redisProperties: {
            type: string;
        };
        subscribe: {
            type: string;
            items: {
                type: string;
            };
        };
    };
};
