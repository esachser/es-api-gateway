import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import { Got } from 'got';
import Keyv from 'keyv';
export declare class EsHttpRequestMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsHttpRequestMiddleware";
    static readonly meta: {
        middleware: string;
    };
    values: any;
    readonly cache: Keyv | undefined;
    readonly got: Got;
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api: string, nextMiddleware?: IEsMiddleware);
    loadAsync(): Promise<void>;
    runInternal(context: IEsContext): Promise<void>;
}
export declare const MiddlewareCtor: IEsMiddlewareConstructor;
export declare const MiddlewareSchema: {
    $schema: string;
    $id: string;
    title: string;
    type: string;
    additionalProperties: boolean;
    properties: {
        url: {
            type: string;
        };
        prefixUrl: {
            type: string;
        };
        method: {
            type: string;
        };
        query: {
            type: string;
        };
        headers: {
            type: string;
        };
        body: {
            type: string;
        };
        encoding: {
            type: string;
        };
        timeout: {
            type: string;
        };
        retry: {
            type: string;
        };
        followRedirect: {
            type: string;
        };
        maxRedirects: {
            type: string;
        };
        cache: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                maxAge: {
                    type: string;
                    minimum: number;
                };
                maxSize: {
                    type: string;
                    minimum: number;
                };
                enabled: {
                    type: string;
                };
            };
        };
        keyProp: {
            type: string;
            minLength: number;
        };
        certProp: {
            type: string;
            minLength: number;
        };
        caProp: {
            type: string;
            minLength: number;
        };
    };
};
