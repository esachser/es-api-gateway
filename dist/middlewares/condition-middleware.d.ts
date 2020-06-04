import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsConditionMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
    runInternal(context: IEsContext): Promise<void>;
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
        runAfter: {
            type: string;
        };
    };
};
