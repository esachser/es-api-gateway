import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsForEachMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsForEachMiddleware";
    static readonly meta: {
        middleware: string;
    };
    forEachMiddleware?: IEsMiddleware;
    propArray: string;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware);
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
        propArray: {
            type: string;
        };
        mids: {
            type: string;
            items: {
                $ref: string;
            };
        };
    };
};
