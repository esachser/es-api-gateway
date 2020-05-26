import { IEsMiddlewareConstructor } from '../core';
export declare function loadMiddlewares(): void;
export declare function loadCustomMiddlewares(): void;
export declare function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined;
