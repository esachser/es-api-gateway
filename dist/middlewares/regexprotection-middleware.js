"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsRegexProtectionMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
let EsRegexProtectionMiddleware = /** @class */ (() => {
    class EsRegexProtectionMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._sourceProp = lodash_1.default.get(values, 'sourceProp');
            if (!lodash_1.default.isString(this._sourceProp)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'sourceProp MUST be string');
            }
            let protectionsRegex = [];
            const sqlInjection = lodash_1.default.get(values, 'sqlInjection', true);
            if (!lodash_1.default.isBoolean(sqlInjection)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'sqlInjection MUST be boolean');
            }
            if (sqlInjection) {
                protectionsRegex.push(EsRegexProtectionMiddleware.SQL_INJECTION_REGEX);
            }
            const javaException = lodash_1.default.get(values, 'javaException', true);
            if (!lodash_1.default.isBoolean(javaException)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'javaException MUST be boolean');
            }
            if (javaException) {
                protectionsRegex.push(EsRegexProtectionMiddleware.JAVA_EXCEPTION_REGEX);
            }
            const xPathInjection = lodash_1.default.get(values, 'xPathInjection', true);
            if (!lodash_1.default.isBoolean(xPathInjection)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'xPathInjection MUST be boolean');
            }
            if (xPathInjection) {
                protectionsRegex.push(EsRegexProtectionMiddleware.XPATH_INJECTION_REGEX);
            }
            const xPathExpandedInjection = lodash_1.default.get(values, 'xPathExpandedInjection', true);
            if (!lodash_1.default.isBoolean(xPathExpandedInjection)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'xPathExpandedInjection MUST be boolean');
            }
            if (xPathExpandedInjection) {
                protectionsRegex.push(EsRegexProtectionMiddleware.XPATH_EXPANDED_INJECTION_REGEX);
            }
            const javascriptException = lodash_1.default.get(values, 'javascriptException', true);
            if (!lodash_1.default.isBoolean(javascriptException)) {
                throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, 'javascriptException MUST be boolean');
            }
            if (javascriptException) {
                protectionsRegex.push(EsRegexProtectionMiddleware.JAVASCRIPT_EXCEPTION_REGEX);
            }
            this._regex = new RegExp(protectionsRegex.join('|'), 'gmi');
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const sourceStr = lodash_1.default.get(context.properties, this._sourceProp);
                if (!lodash_1.default.isString(sourceStr)) {
                    throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, `The resource filename (prop ${this._sourceProp}) MUST be string`);
                }
                this._regex.lastIndex = 0;
                if (this._regex.test(sourceStr)) {
                    throw new errors_1.EsMiddlewareError(EsRegexProtectionMiddleware.name, `Regex Protection of resource ${this._sourceProp} triggered`);
                }
            });
        }
    }
    EsRegexProtectionMiddleware.isInOut = true;
    EsRegexProtectionMiddleware.middlewareName = 'EsRegexProtectionMiddleware';
    EsRegexProtectionMiddleware.meta = { middleware: EsRegexProtectionMiddleware.middlewareName };
    EsRegexProtectionMiddleware.SQL_INJECTION_REGEX = ".*'.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    EsRegexProtectionMiddleware.JAVA_EXCEPTION_REGEX = ".*Exception in thread.*";
    EsRegexProtectionMiddleware.XPATH_INJECTION_REGEX = ".*'.*|.*or.*|.*1=1.*|.*ALTER.*|.*ALTER TABLE.*|.*ALTER VIEW.*|.*CREATE DATABASE.*|.*CREATE PROCEDURE.*|.*CREATE SCHEMA.*|.*create table.*|.*CREATE VIEW.*|.*DELETE.*|.*DROP DATABASE.*|.*DROP PROCEDURE.*|.*DROP.*|.*SELECT.*";
    EsRegexProtectionMiddleware.XPATH_EXPANDED_INJECTION_REGEX = "/?(ancestor(-or-self)?|descendant(-or-self)?|following(-sibling))";
    EsRegexProtectionMiddleware.JAVASCRIPT_EXCEPTION_REGEX = "<\\s*script\\b[^>]*>[^<]+<\\s*/\\s*script\\s*>";
    return EsRegexProtectionMiddleware;
})();
exports.EsRegexProtectionMiddleware = EsRegexProtectionMiddleware;
exports.MiddlewareCtor = EsRegexProtectionMiddleware;
exports.MiddlewareSchema = {
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
//# sourceMappingURL=regexprotection-middleware.js.map