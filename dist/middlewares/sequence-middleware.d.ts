import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsSequenceMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
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
                anyOf: ({
                    $ref: string;
                    type?: undefined;
                    items?: undefined;
                } | {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    $ref?: undefined;
                })[];
            };
        };
        runAfter: {
            type: string;
        };
    };
};
