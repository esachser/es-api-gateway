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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsMetricsMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
let EsMetricsMiddleware = /** @class */ (() => {
    class EsMetricsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            // Verifica values contra o esquema.
            this.values = values;
            this.next = nextMiddleware;
            if (!lodash_1.default.isString(values['prop'])) {
                throw new errors_1.EsMiddlewareError(EsMetricsMiddleware.middlewareName, 'prop MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        execute(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const meta = lodash_1.default.merge(EsMetricsMiddleware.meta, context.meta);
                let init = new Date().valueOf();
                yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                let end = new Date().valueOf();
                let diff = end - init;
                context.logger.info(`Duration: ${diff}ms`, meta);
                lodash_1.default.set(context.properties, this.values['prop'], diff);
            });
        }
    }
    EsMetricsMiddleware.isInOut = true;
    EsMetricsMiddleware.middlewareName = 'EsMetricsMiddleware';
    EsMetricsMiddleware.meta = { middleware: EsMetricsMiddleware.middlewareName };
    return EsMetricsMiddleware;
})();
exports.EsMetricsMiddleware = EsMetricsMiddleware;
;
exports.MiddlewareCtor = EsMetricsMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsMetricsMiddleware",
    "title": "Metrics Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "prop"
    ],
    "properties": {
        "prop": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=metrics-middleware.js.map