import { IEsMiddleware, EsMiddleware, IEsMiddlewareConstructor, IEsContext } from '../core';
export declare class EsParallelMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware);
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
        mids: {
            type: string;
            items: {
                type: string;
                items: {
                    $ref: string;
                };
            };
        };
    };
};
