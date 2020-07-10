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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsThrowMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
let EsThrowMiddleware = /** @class */ (() => {
    class EsThrowMiddleware extends core_1.EsMiddleware {
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
                let err = lodash_1.default.get(context.properties, lodash_1.default.get(this.values, 'errorProp', 'error'), {});
                if (!lodash_1.default.isObjectLike(err)) {
                    err = { error: err };
                }
                throw new errors_1.EsMiddlewareError(EsThrowMiddleware.middlewareName, 'Throw error middleware', lodash_1.default.merge({}, err, EsThrowMiddleware.meta));
            });
        }
    }
    EsThrowMiddleware.isInOut = true;
    EsThrowMiddleware.middlewareName = 'EsThrowMiddleware';
    EsThrowMiddleware.meta = { middleware: EsThrowMiddleware.middlewareName };
    return EsThrowMiddleware;
})();
exports.EsThrowMiddleware = EsThrowMiddleware;
;
exports.MiddlewareCtor = EsThrowMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsThrowMiddleware",
    "title": "Throw Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "errorProp"
    ],
    "properties": {
        "errorProp": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=throw-middleware.js.map