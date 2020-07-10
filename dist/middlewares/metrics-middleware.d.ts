import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsMetricsMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsMetricsMiddleware";
    static readonly meta: {
        middleware: string;
    };
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware);
    loadAsync(): Promise<void>;
    execute(context: IEsContext): Promise<void>;
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
        prop: {
            type: string;
        };
    };
};
