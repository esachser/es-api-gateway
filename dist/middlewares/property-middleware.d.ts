import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import { VMScript } from 'vm2';
export declare class EsPropertyMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters;
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
export declare const EsPropertyMiddlwareParams: IEsMiddlewareParams;
export declare const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor;
