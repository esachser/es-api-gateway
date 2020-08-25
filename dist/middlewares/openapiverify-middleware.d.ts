import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsOpenApiVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsOpenApiVerifyMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _oasValidator?;
    private _propResult?;
    private _throw?;
    private _propMethod;
    private _propUrl;
    private _propBody;
    private _propHeaders;
    private _propQuery;
    private _propParams;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware);
    loadAsync(values: any): Promise<void>;
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
        oas: {
            type: string;
        };
        throw: {
            type: string;
        };
        propResult: {
            type: string;
        };
        method: {
            type: string;
        };
        url: {
            type: string;
        };
        body: {
            type: string;
        };
        headers: {
            type: string;
        };
        query: {
            type: string;
        };
        params: {
            type: string;
        };
    };
};
