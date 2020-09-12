import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsGetResourceMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsGetResourceMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private readonly _resourceProp;
    private readonly _destProp;
    private readonly _destStatProp;
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
        resourceProp: {
            type: string;
        };
        destProp: {
            type: string;
        };
        destStatProp: {
            type: string;
        };
    };
};
