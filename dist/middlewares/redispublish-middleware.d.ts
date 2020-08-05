import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsRedisPublishMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsRedisPublishMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _srcProp;
    private _redisDestProp;
    private _waitFor;
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
        redisDestProp: {
            type: string;
            minLength: number;
        };
        waitFor: {
            type: string;
        };
    };
};
