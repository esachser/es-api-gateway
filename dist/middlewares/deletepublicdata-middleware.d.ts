import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsDeletePublicDataMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsDeletePublicDataMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _srcProp;
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
    };
};
