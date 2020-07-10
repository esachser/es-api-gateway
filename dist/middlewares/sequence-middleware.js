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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsSequenceMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
let EsSequenceMiddleware = /** @class */ (() => {
    class EsSequenceMiddleware extends core_1.EsMiddleware {
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
                            this.values['mids'][i] = yield core_1.createMiddleware(ms, 0);
                        }
                        else {
                            this.values['mids'][i] = yield core_1.createMiddleware([ms], 0);
                        }
                    }
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsSequenceMiddleware.middlewareName, `values.mids MUST be array`);
                }
            });
        }
        runInternal(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const meta = lodash_1.default.merge({}, EsSequenceMiddleware.meta, context.meta);
                if (Array.isArray(this.values['mids'])) {
                    for (let i = 0; i < this.values['mids'].length; i++) {
                        context.logger.debug(`Running middleware ${i}`, meta);
                        yield ((_a = this.values['mids'][i]) === null || _a === void 0 ? void 0 : _a.execute(context).catch((e) => { throw e; }));
                    }
                }
            });
        }
    }
    EsSequenceMiddleware.isInOut = true;
    EsSequenceMiddleware.middlewareName = 'EsSequenceMiddleware';
    EsSequenceMiddleware.meta = { middleware: EsSequenceMiddleware.middlewareName };
    return EsSequenceMiddleware;
})();
exports.EsSequenceMiddleware = EsSequenceMiddleware;
;
exports.MiddlewareCtor = EsSequenceMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsSequenceMiddleware",
    "title": "Sequence Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "anyOf": [
                    {
                        "$ref": "es-middleware"
                    },
                    {
                        "type": "array",
                        "items": {
                            "$ref": "es-middleware"
                        }
                    }
                ]
            }
        }
    }
};
//# sourceMappingURL=sequence-middleware.js.map