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
exports.getCustomSchema = exports.getCustomConstructor = exports.removeMiddleware = exports.removeAllCustomMiddlewares = exports.getMiddlewareConstructor = exports.addMiddleware = void 0;
const _1 = require(".");
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const mids = {};
function addMiddleware(name, constructor, parameters, custom = false) {
    try {
        logger_1.logger.info(`Loading ${name} Middleware`);
        schemas_1.addNewSchema(name, parameters);
        mids[name] = {
            mc: constructor,
            custom
        };
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${name} -- `, err);
    }
}
exports.addMiddleware = addMiddleware;
function getMiddlewareConstructor(name) {
    var _a;
    return (_a = mids[name]) === null || _a === void 0 ? void 0 : _a.mc;
}
exports.getMiddlewareConstructor = getMiddlewareConstructor;
function removeAllCustomMiddlewares() {
    for (const k of Object.keys(mids)) {
        if (mids[k].custom) {
            delete mids[k];
        }
    }
}
exports.removeAllCustomMiddlewares = removeAllCustomMiddlewares;
function removeMiddleware(name) {
    if (mids[name] !== undefined) {
        delete mids[name];
    }
}
exports.removeMiddleware = removeMiddleware;
function getCustomConstructor(mids) {
    return class extends _1.EsMiddleware {
        constructor(_values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this._mid = yield _1.createMiddleware(mids, 0, this.api);
            });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._mid !== undefined) {
                    yield this._mid.execute(context);
                }
            });
        }
    };
}
exports.getCustomConstructor = getCustomConstructor;
function getCustomSchema(name) {
    return {
        "$schema": "http://json-schema.org/draft-07/schema",
        "$id": `https://esachser.github.io/es-apigw/v1/schemas/Custom-${name}`,
        "title": `Custom Middleware (${name})`,
        "type": "object",
        "additionalProperties": true
    };
}
exports.getCustomSchema = getCustomSchema;
//# sourceMappingURL=middlewares.js.map