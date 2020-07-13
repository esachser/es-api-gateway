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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsParallelMiddleware = void 0;
const core_1 = require("../core");
const errors_1 = require("../core/errors");
let EsParallelMiddleware = /** @class */ (() => {
    class EsParallelMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            // Verifica values contra o esquema.
            this.values = {};
            this.values['mids'] = [];
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(values['mids'])) {
                    for (let i = 0; i < values['mids'].length; i++) {
                        let ms = values['mids'][i];
                        if (Array.isArray(ms)) {
                            this.values['mids'][i] = yield core_1.createMiddleware(ms, 0, this.api);
                        }
                        else {
                            throw new errors_1.EsMiddlewareError(EsParallelMiddleware.middlewareName, `values.mids[${i}] MUST be array`);
                        }
                    }
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsParallelMiddleware.middlewareName, `values.mids MUST be array`);
                }
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                Promise.all(this.values['mids'].map((m) => m === null || m === void 0 ? void 0 : m.execute(context)));
            });
        }
    }
    EsParallelMiddleware.isInOut = true;
    EsParallelMiddleware.middlewareName = 'EsParallelMiddleware';
    EsParallelMiddleware.meta = { middleware: EsParallelMiddleware.middlewareName };
    return EsParallelMiddleware;
})();
exports.EsParallelMiddleware = EsParallelMiddleware;
;
exports.MiddlewareCtor = EsParallelMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsParallelMiddleware",
    "title": "Parallel Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "$ref": "es-middleware"
                }
            }
        }
    }
};
//# sourceMappingURL=parallel-middleware.js.map