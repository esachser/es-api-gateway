import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
export declare class EsGrpcRequestMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsGrpcRequestMiddleware";
    static readonly meta: {
        middleware: string;
    };
    private _grpcObj;
    private _pkgProp;
    private _serviceProp;
    private _methodProp;
    private _bodyProp;
    private _headersProp;
    private _addrProp;
    private _resultProp;
    private _keyFile;
    private _keyPassProp;
    private _certFile;
    private _certChainFile;
    private _enableSsl;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware);
    loadAsync(values: any): Promise<void>;
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
        proto: {
            type: string;
        };
        packageProp: {
            type: string;
            minLegth: number;
        };
        serviceProp: {
            type: string;
            minLegth: number;
        };
        methodProp: {
            type: string;
            minLegth: number;
        };
        bodyProp: {
            type: string;
            minLegth: number;
        };
        headersProp: {
            type: string;
            minLegth: number;
        };
        addressProp: {
            type: string;
            minLegth: number;
        };
        resultProp: {
            type: string;
            minLegth: number;
        };
        enableSsl: {
            type: string;
        };
        keyFile: {
            type: string;
            minLegth: number;
        };
        keyPassProp: {
            type: string;
            minLegth: number;
        };
        certFile: {
            type: string;
            minLegth: number;
        };
        certChainFile: {
            type: string;
            minLegth: number;
        };
    };
};
