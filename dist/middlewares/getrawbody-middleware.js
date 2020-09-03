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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsGetRawBodyMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const raw_body_1 = __importDefault(require("raw-body"));
const is_stream_1 = __importDefault(require("is-stream"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
let EsGetRawBodyMiddleware = /** @class */ (() => {
    class EsGetRawBodyMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._streamProp = lodash_1.default.get(values, 'streamProp');
            if (!lodash_1.default.isString(this._streamProp)) {
                throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'streamProp MUST be string');
            }
            this._maxLenProp = lodash_1.default.get(values, 'maxLenProp');
            if (!lodash_1.default.isUndefined(this._maxLenProp) && !lodash_1.default.isString(this._maxLenProp)) {
                throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'maxLenProp MUST be string');
            }
            this._destProp = lodash_1.default.get(values, 'destProp', 'request.body');
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'destProp MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const stream = lodash_1.default.get(context.properties, this._streamProp);
                if (!is_stream_1.default.readable(stream)) {
                    throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Not a stream readable');
                }
                const maxLen = this._maxLenProp !== undefined ? lodash_1.default.get(context.properties, this._maxLenProp, EsGetRawBodyMiddleware.DEFAULT_MAXLEN) : EsGetRawBodyMiddleware.DEFAULT_MAXLEN;
                if (!lodash_1.default.isNumber(maxLen) || maxLen <= 0) {
                    throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'maxLen MUST be a number greater than 0');
                }
                try {
                    const rawBody = yield raw_body_1.default(stream, {
                        limit: maxLen
                    });
                    if (rawBody.length > 0) {
                        lodash_1.default.set(context.properties, this._destProp, rawBody);
                    }
                }
                catch (err) {
                    if (Boolean(err.expose)) {
                        throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Error in payload', err, err.message, (_a = err.status) !== null && _a !== void 0 ? _a : 400);
                    }
                    else {
                        throw new errors_1.EsMiddlewareError(EsGetRawBodyMiddleware.name, 'Error in payload', err);
                    }
                }
            });
        }
    }
    EsGetRawBodyMiddleware.isInOut = true;
    EsGetRawBodyMiddleware.middlewareName = 'EsGetRawBodyMiddleware';
    EsGetRawBodyMiddleware.meta = { middleware: EsGetRawBodyMiddleware.middlewareName };
    EsGetRawBodyMiddleware.DEFAULT_MAXLEN = 10 * 1024;
    return EsGetRawBodyMiddleware;
})();
exports.EsGetRawBodyMiddleware = EsGetRawBodyMiddleware;
;
exports.MiddlewareCtor = EsGetRawBodyMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetRawBodyMiddleware",
    "title": "GetRawBody Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "streamProp",
    ],
    "properties": {
        "streamProp": {
            "type": "string",
            "minLength": 1
        },
        "maxLenProp": {
            "type": "string",
            "minLength": 1
        },
        "destProp": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=getrawbody-middleware.js.map