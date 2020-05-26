import { IEsTransport, EsParameters, IEsMiddleware, IEsTranportConstructor } from '../core';
export declare class EsHttpTransport implements IEsTransport {
    parameters: EsParameters;
    preMiddleware: IEsMiddleware | undefined;
    posMiddleware: IEsMiddleware | undefined;
    central: IEsMiddleware | undefined;
    routeContext: string;
    /**
     *
     */
    constructor(params: any, pre: IEsMiddleware | undefined, pos: IEsMiddleware | undefined, central: IEsMiddleware | undefined);
}
export declare const EsHttpTransportContructor: IEsTranportConstructor;
