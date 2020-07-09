import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsRateLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsRateLimiterMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _rateLimiter;
    private _destProp;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware);
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
        points: {
            type: string;
            exclusiveMinimum: number;
        };
        duration: {
            type: string;
            exclusiveMinimum: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
    };
};
