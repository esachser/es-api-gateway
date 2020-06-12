import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsConditionMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsConditionMiddleware";
    static readonly meta: {
        middleware: string;
    };
    values: any;
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
        conditions: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    conditionExpression: {
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
        };
    };
};
