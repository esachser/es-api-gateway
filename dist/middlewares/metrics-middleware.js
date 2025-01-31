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
const middlewares_1 = require("../core/middlewares");
let EsMetricsMiddleware = /** @class */ (() => {
    class EsMetricsMiddleware extends middlewares_1.IEsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            // Verifica values contra o esquema.
            super();
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
                if (context.logger.level === 'debug') {
                    context.logger.debug({ properties: context.properties, middleware: this.constructor.name });
                }
                const meta = lodash_1.default.merge({}, EsMetricsMiddleware.meta, context.meta);
                let init = process.hrtime();
                let e = undefined;
                try {
                    yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                }
                catch (err) {
                    e = err;
                }
                const diffs = process.hrtime(init);
                const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                context.logger.debug(`Duration: ${diff}ms`, meta);
                lodash_1.default.set(context.properties, this.values['prop'], diff);
                if (e !== undefined) {
                    throw e;
                }
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