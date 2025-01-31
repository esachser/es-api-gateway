import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsAuthenticateMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsAuthenticateMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _propToken;
    private _propScope;
    private _tokenType;
    private _authenticatorId;
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
        propToken: {
            type: string;
            minLength: number;
        };
        propScope: {
            type: string;
            minLength: number;
        };
        tokenType: {
            type: string;
            enum: string[];
        };
        authenticatorId: {
            type: string;
            minLength: number;
        };
    };
};
