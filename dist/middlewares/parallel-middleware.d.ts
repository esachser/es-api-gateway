import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
export declare class EsParallelMiddleware implements IEsMiddleware {
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
export declare const EsParallelMiddlwareParams: IEsMiddlewareParams;
export declare const EsParallelMiddlewareContructor: IEsMiddlewareConstructor;
