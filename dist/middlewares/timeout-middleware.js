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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsTimeoutMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
let EsTimeoutMiddleware = /** @class */ (() => {
    class EsTimeoutMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._timeout = lodash_1.default.get(values, 'timeout');
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
            });
        }
        execute(context) {
            const _super = Object.create(null, {
                execute: { get: () => super.execute }
            });
            return __awaiter(this, void 0, void 0, function* () {
                let timeoutHandle;
                const values = lodash_1.default.clone(context.properties);
                const delayRun = new Promise((res, rej) => {
                    timeoutHandle = setTimeout(() => {
                        lodash_1.default.set(context, 'properties', values);
                        rej(new errors_1.EsMiddlewareError(this.constructor.name, 'Timeout reached', undefined, undefined, 408));
                    }, this._timeout);
                });
                const exec = new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
                    yield _super.execute.call(this, context);
                    if (timeoutHandle !== undefined) {
                        clearTimeout(timeoutHandle);
                    }
                    res();
                }));
                yield Promise.race([exec, delayRun]);
            });
        }
    }
    EsTimeoutMiddleware.isInOut = true;
    EsTimeoutMiddleware.middlewareName = 'EsTimeoutMiddleware';
    EsTimeoutMiddleware.meta = { middleware: EsTimeoutMiddleware.middlewareName };
    return EsTimeoutMiddleware;
})();
exports.EsTimeoutMiddleware = EsTimeoutMiddleware;
;
exports.MiddlewareCtor = EsTimeoutMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsTimeoutMiddleware",
    "title": "Timeout Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "timeout"
    ],
    "properties": {
        "timeout": {
            "type": "integer",
            "minValue": 0
        }
    }
};
//# sourceMappingURL=timeout-middleware.js.map