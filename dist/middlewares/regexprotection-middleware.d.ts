import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
export declare class EsRegexProtectionMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = "EsRegexProtectionMiddleware";
    static readonly meta: {
        middleware: string;
    };
    static readonly SQL_INJECTION_REGEX = ".*'.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    static readonly JAVA_EXCEPTION_REGEX = ".*Exception in thread.*";
    static readonly XPATH_INJECTION_REGEX = ".*'.*|.*or.*|.*1=1.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    static readonly XPATH_EXPANDED_INJECTION_REGEX = "/?(ancestor(-or-self)?|descendant(-or-self)?|following(-sibling))";
    static readonly JAVASCRIPT_EXCEPTION_REGEX = "<\\s*script\\b[^>]*>[^<]+<\\s*/\\s*script\\s*>";
    private readonly _sourceProp;
    private readonly _regex;
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
    required: string[];
    properties: {
        sqlInjection: {
            type: string;
        };
        javaException: {
            type: string;
        };
        xPathInjection: {
            type: string;
        };
        xPathExpandedInjection: {
            type: string;
        };
        javascriptException: {
            type: string;
        };
        sourceProp: {
            type: string;
        };
    };
};
