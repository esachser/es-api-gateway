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
let EsParallelMiddleware = /** @class */ (() => {
    class EsParallelMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, nextMiddleware) {
            // Verifica values contra o esquema.
            this.values = {};
            this.values['after'] = values['after'];
            this.values['mids'] = [];
            this.next = nextMiddleware;
            if (Array.isArray(values['mids'])) {
                values['mids'].forEach((ms, i) => __awaiter(this, void 0, void 0, function* () {
                    if (Array.isArray(ms)) {
                        this.values['mids'][i] = yield core_1.createMiddleware(ms, 0);
                    }
                }));
            }
        }
        execute(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const rAfter = Boolean(this.values['after']);
                if (!rAfter) {
                    yield Promise.all(this.values['mids'].map((m) => m === null || m === void 0 ? void 0 : m.execute(context)));
                }
                yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                if (rAfter) {
                    yield Promise.all(this.values['mids'].map((m) => m === null || m === void 0 ? void 0 : m.execute(context)));
                }
            });
        }
    }
    EsParallelMiddleware.isInOut = true;
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
        "mids",
        "after"
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
        },
        "after": {
            "type": "boolean"
        }
    }
};
//# sourceMappingURL=parallel-middleware.js.map