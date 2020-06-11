import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import ChowChow from "oas3-chow-chow";
export declare class EsOpenApiVerifyMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    values: any;
    oasValidator?: ChowChow;
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
        oas: {
            type: string;
        };
    };
};
