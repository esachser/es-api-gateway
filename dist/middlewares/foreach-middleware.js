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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsForEachMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
let EsForEachMiddleware = /** @class */ (() => {
    class EsForEachMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            this.propArray = 'foreachElement';
            this.propArray = lodash_1.default.get(values, 'propArray', 'foreachElement');
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (lodash_1.default.isArray(values['mids'])) {
                    this.forEachMiddleware = yield core_1.createMiddleware(values['mids'], 0);
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsForEachMiddleware.middlewareName, 'mids MUST be array');
                }
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                // Lê propriedade
                const prop = lodash_1.default.get(context.properties, this.propArray, []);
                if (lodash_1.default.isArray(prop)) {
                    for (const v of prop) {
                    }
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsForEachMiddleware.middlewareName, `${this.propArray} MUST be array`);
                }
            });
        }
    }
    EsForEachMiddleware.isInOut = true;
    EsForEachMiddleware.middlewareName = 'EsForEachMiddleware';
    EsForEachMiddleware.meta = { middleware: EsForEachMiddleware.middlewareName };
    return EsForEachMiddleware;
})();
exports.EsForEachMiddleware = EsForEachMiddleware;
;
exports.MiddlewareCtor = EsForEachMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsForEachMiddleware",
    "title": "ForEach Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "propArray",
        "mids"
    ],
    "properties": {
        "propArray": {
            "type": "string"
        },
        "mids": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        }
    }
};
//# sourceMappingURL=foreach-middleware.js.map