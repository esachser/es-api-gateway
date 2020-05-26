import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor } from '../core';
export declare class EsPropertyMiddleware implements IEsMiddleware {
    parameters: EsParameters;
    values: any;
    next?: IEsMiddleware;
    isInOut: boolean;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
    execute(context: IEsContext): Promise<void | undefined>;
}
export declare const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor;
