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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsCatchMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
let EsCatchMiddleware = /** @class */ (() => {
    class EsCatchMiddleware extends core_1.IEsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super();
            // Verifica values contra o esquema.
            this.next = nextMiddleware;
            this.api = api;
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (lodash_1.default.isArray(values['mids'])) {
                    this.catchMiddleware = yield core_1.createMiddleware(values['mids'], 0, this.api);
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsCatchMiddleware.middlewareName, 'mids MUST be array');
                }
            });
        }
        execute(context) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                }
                catch (err) {
                    if (err instanceof errors_1.EsMiddlewareError) {
                        yield ((_b = this.catchMiddleware) === null || _b === void 0 ? void 0 : _b.execute(context));
                    }
                    else {
                        throw err;
                    }
                }
            });
        }
    }
    EsCatchMiddleware.isInOut = true;
    EsCatchMiddleware.middlewareName = 'EsCatchMiddleware';
    EsCatchMiddleware.meta = { middleware: EsCatchMiddleware.middlewareName };
    return EsCatchMiddleware;
})();
exports.EsCatchMiddleware = EsCatchMiddleware;
;
exports.MiddlewareCtor = EsCatchMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsCatchMiddleware",
    "title": "Catch Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        }
    }
};
//# sourceMappingURL=catch-middleware.js.map