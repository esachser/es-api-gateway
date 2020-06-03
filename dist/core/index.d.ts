export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export interface IEsContext {
    properties: {
        [id: string]: any;
    };
    rawbody: string;
    parsedbody?: any;
}
export declare type EsObjectSchema = {
    type: 'object';
    optional: boolean;
    schema: EsObjectSchema;
    defaultValue?: any;
};
export declare type EsOtherSchema = {
    type: 'string' | 'number' | 'boolean' | 'any' | 'array';
    optional: boolean;
    defaultValue?: any;
};
export declare type EsSchema = EsObjectSchema | EsOtherSchema;
export declare type EsParameters = {
    [id: string]: EsSchema;
};
export interface IEsMiddlewareConstructor {
    new (values: any, nextMiddleware?: IEsMiddleware): IEsMiddleware;
}
export interface IEsMiddleware {
    next?: IEsMiddleware;
    execute(context: IEsContext): void;
}
export interface IEsMiddlewareParams {
    parameters: EsParameters;
    isInOut: boolean;
}
export interface IEsTranportConstructor {
    new (params: any, middleware?: IEsMiddleware): IEsTransport;
}
export interface IEsTransport {
    parameters: EsParameters;
    middleware: IEsMiddleware | undefined;
    clear(): void;
}
export declare function createMiddleware(arr: any[], idx: number): Promise<IEsMiddleware | undefined>;
export declare function connect2Mids(mid1: IEsMiddleware, mid2: IEsMiddleware): void;
export declare function connectMiddlewares(...middlewares: (IEsMiddleware | undefined)[]): IEsMiddleware | undefined;
export declare function createTransport(type: string, parameters: any, middleware: IEsMiddleware | undefined): IEsTransport | undefined;
