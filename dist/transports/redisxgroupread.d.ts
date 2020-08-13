import { IEsTransport, IEsMiddleware, IEsTranportConstructor } from '../core';
import { Logger } from 'winston';
export declare class EsRedisXgroupreadTransport implements IEsTransport {
    middleware: IEsMiddleware | undefined;
    apiLogger: Logger;
    api: string;
    tid: string;
    private _redis;
    private _groupStr;
    private _streamStr;
    private _id;
    private _kill;
    /**
     *
     */
    constructor(params: any, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware);
    loadAsync(params: any): Promise<void>;
    run(): Promise<void>;
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
        group: {
            type: string;
        };
        stream: {
            type: string;
        };
    };
};
