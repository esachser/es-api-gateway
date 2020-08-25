import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsRedisSetMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsRedisSetMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _srcProp;
    private _ttlProp?;
    private _redisDestProp;
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
        sourceProp: {
            type: string;
            minLength: number;
        };
        ttlProp: {
            type: string;
            minLength: number;
        };
        redisProperties: {
            type: string;
        };
        redisDestProp: {
            type: string;
            minLength: number;
        };
    };
};
