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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsDelayMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const util_1 = require("../util");
let EsDelayMiddleware = /** @class */ (() => {
    class EsDelayMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this.values = values;
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                let delayTime = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'delayProp', 'delay'), 0);
                try {
                    if (lodash_1.default.isString(delayTime)) {
                        delayTime = Number.parseInt(delayTime);
                    }
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(this.constructor.name, 'delay MUST be a number greater or equal to zero', err);
                }
                if (!lodash_1.default.isNumber(delayTime) || delayTime < 0) {
                    throw new errors_1.EsMiddlewareError(this.constructor.name, 'delay MUST be a number greater or equal to zero');
                }
                yield util_1.delay(delayTime);
            });
        }
    }
    EsDelayMiddleware.isInOut = true;
    EsDelayMiddleware.middlewareName = 'EsDelayMiddleware';
    EsDelayMiddleware.meta = { middleware: EsDelayMiddleware.middlewareName };
    return EsDelayMiddleware;
})();
exports.EsDelayMiddleware = EsDelayMiddleware;
;
exports.MiddlewareCtor = EsDelayMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsDelayMiddleware",
    "title": "Delay Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "delayProp"
    ],
    "properties": {
        "delayProp": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=delay-middleware.js.map