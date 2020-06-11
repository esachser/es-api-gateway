import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import { Got } from 'got';
import Keyv from 'keyv';
export declare class EsHttpRequestMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    values: any;
    readonly cache: Keyv | undefined;
    readonly got: Got;
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
                };
                maxSize: {
                    type: string;
                };
                enabled: {
                    type: string;
                };
            };
        };
    };
};
