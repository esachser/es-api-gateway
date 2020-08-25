import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsEncodeMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsEncodeMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private readonly _sourceProp;
    private readonly _destProp;
    private readonly _contentType;
    private readonly _parserOpts;
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
    properties: {
        sourceProp: {
            type: string;
            minLength: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
        contentType: {
            type: string;
            minLength: number;
        };
        parserOpts: {
            type: string;
        };
    };
};
