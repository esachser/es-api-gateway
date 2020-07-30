/// <reference types="node" />
import { Logger } from 'winston';
import events from 'events';
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export interface IEsContext {
    properties: {
        [id: string]: any;
    };
    body: string;
    logger: Logger;
    meta: {
        api: string;
        transport: string;
        uid: string;
    };
}
export interface IEsMiddlewareConstructor {
    new (values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware): IEsMiddleware;
}
export interface IEsMiddleware extends events.EventEmitter {
    next?: IEsMiddleware;
    execute(context: IEsContext): Promise<void>;
    loadAsync(values: any): Promise<void>;
}
export declare class IEsMiddleware {
}
export declare abstract class EsMiddleware extends IEsMiddleware {
    next?: IEsMiddleware;
    after: boolean;
    api: string;
    abstract loadAsync(values: any): Promise<void>;
    abstract runInternal(context: IEsContext): Promise<void>;
    constructor(after: boolean, api: string, nextMiddleware: IEsMiddleware | undefined);
    execute(context: IEsContext): Promise<void>;
}
export interface IEsTranportConstructor {
    new (params: any, api: string, tid: string, logger: Logger, middleware?: IEsMiddleware, initMiddleware?: IEsMiddleware): IEsTransport;
}
export interface IEsTransport {
    middleware: IEsMiddleware | undefined;
    loadAsync(params: any): Promise<void>;
    clear(): void;
}
export declare function createMiddleware(arr: any[], idx: number, api: string): Promise<IEsMiddleware | undefined>;
export declare function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware): void;
export declare function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]): IEsMiddleware | undefined;
export declare function createTransport(type: string, api: string, tid: string, logger: Logger, parameters: any, middleware: IEsMiddleware | undefined, initialMid?: IEsMiddleware): Promise<IEsTransport>;
