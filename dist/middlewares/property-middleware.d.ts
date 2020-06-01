import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
export declare class EsPropertyMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters;
    static readonly isInOut = true;
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
    execute(context: IEsContext): Promise<void>;
}
export declare const EsPropertyMiddlwareParams: IEsMiddlewareParams;
export declare const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor;
