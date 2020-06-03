import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import { VMScript } from 'vm2';
export declare class EsPropertyMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    readonly vmScript: VMScript;
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
        name: {
            type: string;
        };
        value: {
            type: string[];
        };
        expression: {
            type: string;
        };
        runAfter: {
            type: string;
        };
    };
    oneOf: {
        required: string[];
    }[];
};
