/// <reference types="node" />
import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import vm from 'vm';
export declare class EsExecJsMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsExecJsMiddleware";
    static readonly meta: {
        middleware: string;
    };
    values: any;
    readonly vmScript?: vm.Script;
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
        script: {
            type: string;
        };
    };
};
