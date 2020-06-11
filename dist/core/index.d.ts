export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export interface IEsContext {
    properties: {
        [id: string]: any;
    };
    rawbody: string;
    parsedbody?: any;
}
export interface IEsMiddlewareConstructor {
    new (values: any, after: boolean, nextMiddleware?: IEsMiddleware): IEsMiddleware;
}
export interface IEsMiddleware {
    next?: IEsMiddleware;
    execute(context: IEsContext): Promise<void>;
}
export declare abstract class EsMiddleware implements IEsMiddleware {
    next?: IEsMiddleware;
    after: boolean;
    abstract runInternal(context: IEsContext): Promise<void>;
    constructor(after: boolean, nextMiddleware: IEsMiddleware | undefined);
    execute(context: IEsContext): Promise<void>;
}
export interface IEsTranportConstructor {
    new (params: any, middleware?: IEsMiddleware): IEsTransport;
}
export interface IEsTransport {
    middleware: IEsMiddleware | undefined;
    clear(): void;
}
export declare function createMiddleware(arr: any[], idx: number): Promise<IEsMiddleware | undefined>;
export declare function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware): void;
export declare function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]): IEsMiddleware | undefined;
export declare function createTransport(type: string, parameters: any, middleware: IEsMiddleware | undefined): Promise<IEsTransport | undefined>;
