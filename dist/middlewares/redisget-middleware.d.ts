import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsRedisGetMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsRedisGetMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _destProp;
    private _redisSourceProp;
    private _redis;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware);
    loadAsync(): Promise<void>;
    runInternal(context: IEsContext): Promise<void>;
}
export declare const MiddlewareCtor: IEsMiddlewareConstructor;
export declare const MiddlewareSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        destProp: {
            type: string;
            minLength: number;
        };
        redisProperties: {
            type: string;
        };
        redisSourceProp: {
            type: string;
            minLength: number;
        };
    };
};
