import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
export declare class EsMetricsMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters;
    static readonly isInOut = false;
    values: any;
    next?: IEsMiddleware;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware);
    execute(context: IEsContext): Promise<void>;
}
export declare const EsMetricsMiddlwareParams: IEsMiddlewareParams;
export declare const EsMetricsMiddlewareContructor: IEsMiddlewareConstructor;
