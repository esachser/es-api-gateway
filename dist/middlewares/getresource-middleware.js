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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsGetResourceMiddleware = void 0;
const lodash_1 = __importDefault(require("lodash"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const resources_1 = require("../util/resources");
let EsGetResourceMiddleware = /** @class */ (() => {
    class EsGetResourceMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            this._resourceProp = lodash_1.default.get(values, 'resourceProp');
            if (!lodash_1.default.isString(this._resourceProp)) {
                throw new errors_1.EsMiddlewareError(EsGetResourceMiddleware.name, 'resourceProp MUST be string');
            }
            this._destProp = lodash_1.default.get(values, 'destProp', 'response.body');
            if (!lodash_1.default.isString(this._destProp)) {
                throw new errors_1.EsMiddlewareError(EsGetResourceMiddleware.name, 'destProp MUST be string');
            }
            this._destStatProp = lodash_1.default.get(values, 'destStatProp', 'resource.stat');
            if (!lodash_1.default.isString(this._destStatProp)) {
                throw new errors_1.EsMiddlewareError(EsGetResourceMiddleware.name, 'destStatProp MUST be string');
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                const resourceStr = lodash_1.default.get(context.properties, this._resourceProp);
                if (!lodash_1.default.isString(resourceStr)) {
                    throw new errors_1.EsMiddlewareError(EsGetResourceMiddleware.name, `The resource filename (prop ${this._resourceProp}) MUST be string`);
                }
                try {
                    const stat = yield resources_1.getResourceStat(resourceStr, context.meta.api);
                    const resource = yield resources_1.getResourceFileStream(resourceStr, context.meta.api);
                    lodash_1.default.set(context.properties, this._destProp, resource);
                    lodash_1.default.set(context.properties, this._destStatProp, stat);
                }
                catch (err) {
                    throw new errors_1.EsMiddlewareError(EsGetResourceMiddleware.name, 'Not Found', err, 'The resource has not been found', 404);
                }
            });
        }
    }
    EsGetResourceMiddleware.isInOut = true;
    EsGetResourceMiddleware.middlewareName = 'EsGetResourceMiddleware';
    EsGetResourceMiddleware.meta = { middleware: EsGetResourceMiddleware.middlewareName };
    return EsGetResourceMiddleware;
})();
exports.EsGetResourceMiddleware = EsGetResourceMiddleware;
exports.MiddlewareCtor = EsGetResourceMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsGetResourceMiddleware",
    "title": "GetResource Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "resourceProp"
    ],
    "properties": {
        "resourceProp": {
            "type": "string"
        },
        "destProp": {
            "type": "string"
        },
        "destStatProp": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=getresource-middleware.js.map