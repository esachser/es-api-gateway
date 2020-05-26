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
    type: 'string' | 'number' | 'boolean' | 'any';
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
    parameters: EsParameters;
    values: {
        [id: string]: any;
    };
    isInOut: boolean;
    next?: IEsMiddleware;
    execute(context: IEsContext): void;
}
export interface IEsTranportConstructor {
    new (params: any, pre?: IEsMiddleware, pos?: IEsMiddleware, central?: IEsMiddleware): IEsTransport;
}
export interface IEsTransport {
    parameters: EsParameters;
    preMiddleware: IEsMiddleware | undefined;
    posMiddleware: IEsMiddleware | undefined;
    central: IEsMiddleware | undefined;
}
