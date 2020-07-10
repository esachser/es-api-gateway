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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsRateLimiterMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
let EsRateLimiterMiddleware = /** @class */ (() => {
    class EsRateLimiterMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            const points = lodash_1.default.get(values, 'points');
            const duration = lodash_1.default.get(values, 'duration');
            this._destProp = lodash_1.default.get(values, 'destProp', 'ratelimitres');
            if (!lodash_1.default.isInteger(points) || points <= 0) {
                throw new errors_1.EsMiddlewareError(EsRateLimiterMiddleware.name, 'points MUST be integer and greater than 0');
            }
            if (!lodash_1.default.isInteger(duration) || duration <= 0) {
                throw new errors_1.EsMiddlewareError(EsRateLimiterMiddleware.name, 'duration MUST be integer and greater than 0');
            }
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsRateLimiterMiddleware.name, 'destProp MUST be string');
            }
            this._rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
                points,
                duration
            });
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const r = yield this._rateLimiter.consume(context.meta.api, 1);
                    lodash_1.default.set(context.properties, this._destProp, r);
                }
                catch (err) {
                    if (err instanceof rate_limiter_flexible_1.RateLimiterRes) {
                        lodash_1.default.set(context.properties, this._destProp, err);
                        throw new errors_1.EsMiddlewareError(EsRateLimiterMiddleware.name, `Maximum rate reached`, err, `Wait ${err.msBeforeNext}ms and try again`, 429);
                    }
                    throw new errors_1.EsMiddlewareError(EsRateLimiterMiddleware.name, 'Error running rateLimiter', err);
                }
            });
        }
    }
    EsRateLimiterMiddleware.isInOut = true;
    EsRateLimiterMiddleware.middlewareName = 'EsRateLimiterMiddleware';
    EsRateLimiterMiddleware.meta = { middleware: EsRateLimiterMiddleware.middlewareName };
    return EsRateLimiterMiddleware;
})();
exports.EsRateLimiterMiddleware = EsRateLimiterMiddleware;
;
exports.MiddlewareCtor = EsRateLimiterMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsRateLimiterMiddleware",
    "title": "RateLimiter Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "points",
        "duration"
    ],
    "properties": {
        "points": {
            "type": "integer",
            "exclusiveMinimum": 0
        },
        "duration": {
            "type": "integer",
            "exclusiveMinimum": 0
        },
        "destProp": {
            "type": "string",
            "minLength": 0
        }
    }
};
//# sourceMappingURL=ratelimiter-middleware.js.map