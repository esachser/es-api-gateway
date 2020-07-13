import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsQuotaLimiterMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsQuotaLimiterMiddleware";
    static readonly meta: {
        middleware: string;
    };
    static readonly QUOTA_TYPES: string[];
    static readonly QUOTA_VALIDITIES: number[];
    static readonly QUOTA_FUNCTIONS: ((dt: Date) => Date)[];
    private _redis;
    private _redisKey;
    private _destProp;
    private _sourceProp;
    private _quotaId;
    private _quotaTypeProp;
    private _quotaProp;
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
        quotaProp: {
            type: string;
            minLength: number;
        };
        quotaTypeProp: {
            type: string;
            minLength: number;
        };
        quotaId: {
            type: string;
            minLength: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
    };
};
