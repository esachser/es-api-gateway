/// <reference types="node" />
import { IEsMiddlewareConstructor } from ".";
import { EventEmitter } from 'events';
export declare function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any, custom?: boolean): void;
export declare function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined;
export declare function removeAllCustomMiddlewares(): void;
export declare function removeMiddleware(name: string): void;
export declare function getCustomConstructor(mids: any[], changeEmitter: EventEmitter): IEsMiddlewareConstructor;
export declare function getCustomSchema(name: string): {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
};
