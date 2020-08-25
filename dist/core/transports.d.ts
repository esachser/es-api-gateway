import { Logger } from "winston";
import { IEsMiddleware } from "./middlewares";
export interface IEsTranportConstructor {
    new (params: any, api: string, tid: string, logger: Logger, middleware?: IEsMiddleware, initMiddleware?: IEsMiddleware): IEsTransport;
}
export interface IEsTransport {
    middleware: IEsMiddleware | undefined;
    loadAsync(params: any): Promise<void>;
    clear(): void;
}
export declare function addTransport(name: string, constructor: IEsTranportConstructor, parameters: any): void;
export declare function getTransportConstructor(name: string): IEsTranportConstructor | undefined;
export declare function createTransport(type: string, api: string, tid: string, logger: Logger, parameters: any, middleware: IEsMiddleware | undefined, initialMid?: IEsMiddleware): Promise<IEsTransport>;
