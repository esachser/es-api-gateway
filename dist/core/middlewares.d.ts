import { IEsMiddlewareConstructor } from ".";
export declare function addMiddleware(name: string, constructor: IEsMiddlewareConstructor, parameters: any): void;
export declare function getMiddlewareConstructor(name: string): IEsMiddlewareConstructor | undefined;
