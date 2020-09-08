/// <reference types="node" />
import { EventEmitter } from 'events';
import events from 'events';
import { IEsContext } from ".";
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
export declare function createMiddleware(arr: any[], idx: number, api: string): Promise<IEsMiddleware | undefined>;
export declare function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]): IEsMiddleware | undefined;
export declare function copyMiddleware(mid?: IEsMiddleware): IEsMiddleware | undefined;
export declare function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any, custom?: boolean): void;
export declare function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined;
export declare function removeAllCustomMiddlewares(): void;
export declare function removeMiddleware(name: string): void;
export declare function getCustomConstructor(middlewares: any[], changeEmitter: EventEmitter): IEsMiddlewareConstructor;
export declare function getCustomSchema(name: string): {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
};
