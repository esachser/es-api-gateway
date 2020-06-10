import { IEsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import ChowChow from "oas3-chow-chow";
export declare class EsOpenApiVerifyMiddleware implements IEsMiddleware {
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    oasValidator?: ChowChow;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
    runIntenal(context: IEsContext): Promise<void>;
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
        after: {
            type: string;
        };
        oas: {
            type: string;
        };
    };
};
