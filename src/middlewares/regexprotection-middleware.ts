import _ from 'lodash';
import { EsMiddlewareError } from '../core/errors';
import { EsMiddleware, IEsMiddleware, IEsMiddlewareConstructor } from '../core/middlewares';
import { IEsContext } from '../core';
import { logger } from '../util/logger';

export class EsRegexProtectionMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsRegexProtectionMiddleware';
    static readonly meta = { middleware: EsRegexProtectionMiddleware.middlewareName };

    static readonly SQL_INJECTION_REGEX = ".*'.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    static readonly JAVA_EXCEPTION_REGEX = ".*Exception in thread.*";
    static readonly XPATH_INJECTION_REGEX = ".*'.*|.*or.*|.*1=1.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    static readonly XPATH_EXPANDED_INJECTION_REGEX = "/?(ancestor(-or-self)?|descendant(-or-self)?|following(-sibling))";
    static readonly JAVASCRIPT_EXCEPTION_REGEX = "<\\s*script\\b[^>]*>[^<]+<\\s*/\\s*script\\s*>";

    private readonly _sourceProp: string;
    private readonly _regex: RegExp;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, api:string, nextMiddleware?: IEsMiddleware) {
        super(after, api, nextMiddleware);

        this._sourceProp = _.get(values, 'sourceProp');
        if (!_.isString(this._sourceProp)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'sourceProp MUST be string');
        }

        let protectionsRegex = [];

        const sqlInjection = _.get(values, 'sqlInjection', true);
        if (!_.isBoolean(sqlInjection)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'sqlInjection MUST be boolean');
        }
        if (sqlInjection) {
            protectionsRegex.push(EsRegexProtectionMiddleware.SQL_INJECTION_REGEX);
        }

        const javaException = _.get(values, 'javaException', true);
        if (!_.isBoolean(javaException)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'javaException MUST be boolean');
        }
        if (javaException) {
            protectionsRegex.push(EsRegexProtectionMiddleware.JAVA_EXCEPTION_REGEX);
        }

        const xPathInjection = _.get(values, 'xPathInjection', true);
        if (!_.isBoolean(xPathInjection)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'xPathInjection MUST be boolean');
        }
        if (xPathInjection) {
            protectionsRegex.push(EsRegexProtectionMiddleware.XPATH_INJECTION_REGEX);
        }

        const xPathExpandedInjection = _.get(values, 'xPathExpandedInjection', true);
        if (!_.isBoolean(xPathExpandedInjection)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'xPathExpandedInjection MUST be boolean');
        }
        if (xPathExpandedInjection) {
            protectionsRegex.push(EsRegexProtectionMiddleware.XPATH_EXPANDED_INJECTION_REGEX);
        }

        const javascriptException = _.get(values, 'javascriptException', true);
        if (!_.isBoolean(javascriptException)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, 'javascriptException MUST be boolean');
        }
        if (javascriptException) {
            protectionsRegex.push(EsRegexProtectionMiddleware.JAVASCRIPT_EXCEPTION_REGEX);
        }

        this._regex = new RegExp(protectionsRegex.join('|'), 'gmi');
    }

    async loadAsync() { }

    async runInternal(context: IEsContext) {
        const sourceStr = _.get(context.properties, this._sourceProp);

        if (!_.isString(sourceStr)) {
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, `The resource filename (prop ${this._sourceProp}) MUST be string`);
        }

        this._regex.lastIndex = 0;
        if (this._regex.test(sourceStr)){
            throw new EsMiddlewareError(EsRegexProtectionMiddleware.name, `Regex Protection of resource ${this._sourceProp} triggered`);
        }
    }
}

export const MiddlewareCtor: IEsMiddlewareConstructor = EsRegexProtectionMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRegexProtectionMiddleware",
    "title": "RegexProtection Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "sourceProp"
    ],
    "properties": {
        "sqlInjection": {
            "type": "boolean"
        },
        "javaException": {
            "type": "boolean"
        },
        "xPathInjection": {
            "type": "boolean"
        },
        "xPathExpandedInjection": {
            "type": "boolean"
        },
        "javascriptException": {
            "type": "boolean"
        },
        "sourceProp": {
            "type": "string"
        }
    }
};
