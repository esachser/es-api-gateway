import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsCatchMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsCatchMiddleware";
    static readonly meta: {
        middleware: string;
    };
    catchMiddleware?: IEsMiddleware;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware);
    loadAsync(values: any): Promise<void>;
    execute(context: IEsContext): Promise<void>;
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
        mids: {
            type: string;
            items: {
                $ref: string;
            };
        };
    };
};
