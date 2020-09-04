import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsTimeoutMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsTimeoutMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _timeout;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware);
    loadAsync(): Promise<void>;
    runInternal(context: IEsContext): Promise<void>;
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
        timeout: {
            type: string;
            minValue: number;
        };
    };
};
