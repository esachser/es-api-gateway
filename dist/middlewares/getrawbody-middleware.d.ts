import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsGetRawBodyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsGetRawBodyMiddleware";
    static readonly meta: {
        middleware: string;
    };
    static readonly DEFAULT_MAXLEN: number;
    private _streamProp;
    private _maxLenProp?;
    private _destProp;
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
        streamProp: {
            type: string;
            minLength: number;
        };
        maxLenProp: {
            type: string;
            minLength: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
    };
};
