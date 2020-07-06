import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsLoadPrivateKeyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsLoadPrivateKeyMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _keyFile;
    private _keyPassProp;
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
        keyFile: {
            type: string;
            minLength: number;
        };
        keyPassProp: {
            type: string;
            minLength: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
    };
};
