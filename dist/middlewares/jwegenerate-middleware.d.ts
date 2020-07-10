import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsJweGenerateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsJweGenerateMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _payloadProp;
    private _keyProp;
    private _algProp;
    private _encProp;
    private _useProp?;
    private _othOptsProp?;
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
        payloadProp: {
            type: string;
            minLength: number;
        };
        keyProp: {
            type: string;
            minLength: number;
        };
        algProp: {
            type: string;
            minLength: number;
        };
        encProp: {
            type: string;
            minLength: number;
        };
        useProp: {
            type: string;
            minLength: number;
        };
        othOptsProp: {
            type: string;
            minLength: number;
        };
        destProp: {
            type: string;
            minLength: number;
        };
    };
};
