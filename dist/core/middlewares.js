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
exports.getCustomSchema = exports.getCustomConstructor = exports.removeMiddleware = exports.removeAllCustomMiddlewares = exports.getMiddlewareConstructor = exports.addMiddleware = exports.copyMiddleware = exports.connectMiddlewares = exports.createMiddleware = exports.EsMiddleware = exports.IEsMiddleware = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const envs_1 = require("../envs");
const events_1 = __importDefault(require("events"));
const _1 = require(".");
const errors_1 = require("./errors");
const lodash_1 = __importDefault(require("lodash"));
class IEsMiddleware {
}
exports.IEsMiddleware = IEsMiddleware;
_1.applyMixins(IEsMiddleware, [events_1.default.EventEmitter]);
class EsMiddleware extends IEsMiddleware {
    constructor(after, api, nextMiddleware) {
        super();
        this.after = after;
        this.next = nextMiddleware;
        this.api = api;
    }
    execute(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (context.logger.level === 'debug') {
                context.logger.debug({ properties: context.properties, middleware: this.constructor.name });
            }
            if (this.after) {
                yield ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context));
                yield this.runInternal(context);
            }
            else {
                yield this.runInternal(context);
                yield ((_b = this.next) === null || _b === void 0 ? void 0 : _b.execute(context));
            }
        });
    }
}
exports.EsMiddleware = EsMiddleware;
function createMiddleware(arr, idx, api) {
    return __awaiter(this, void 0, void 0, function* () {
        if (idx >= arr.length) {
            return undefined;
        }
        const type = lodash_1.default.get(arr[idx], 'type');
        const data = lodash_1.default.get(arr[idx], 'data');
        const after = lodash_1.default.get(arr[idx], 'after', false);
        const ctor = getMiddlewareConstructor(type);
        if (ctor === undefined) {
            throw new errors_1.EsMiddlewareError(type, `Constructor of ${type} doesnt exists`);
        }
        const v = yield schemas_1.validateObject(type, data);
        if (!v) {
            throw new errors_1.EsMiddlewareError(type, `${type} parameters are invalid`);
        }
        const mid = new ctor(data, Boolean(after), api, yield createMiddleware(arr, idx + 1, api));
        yield mid.loadAsync(data);
        return mid;
    });
}
exports.createMiddleware = createMiddleware;
function connect2Mids(mid1, mid2) {
    let mid = mid1;
    while (mid.next !== undefined)
        mid = mid.next;
    mid.next = mid2;
}
function connectMiddlewares(...middlewares) {
    let mid = undefined;
    if (middlewares.length > 0) {
        mid = middlewares[0];
        let i = 1;
        while (mid === undefined) {
            mid = middlewares[i];
            i++;
        }
        for (; i < middlewares.length; i++) {
            let md = middlewares[i];
            if (md !== undefined) {
                connect2Mids(mid, md);
            }
        }
    }
    return mid;
}
exports.connectMiddlewares = connectMiddlewares;
function copyMiddleware(mid) {
    if (mid === undefined) {
        return undefined;
    }
    const nmid = lodash_1.default.clone(mid);
    nmid.next = copyMiddleware(mid.next);
    return nmid;
}
exports.copyMiddleware = copyMiddleware;
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
function getCustomConstructor(mids, changeEmitter) {
    var _a;
    return _a = class C extends EsMiddleware {
            constructor(_values, after, api, nextMiddleware) {
                super(after, api, nextMiddleware);
                if (!Boolean(C.emitters[api])) {
                    changeEmitter.once('change', () => setImmediate(() => {
                        envs_1.reloadApi(this.api).catch(err => logger_1.logger.error(`Error reloading API ${this.api}`, err));
                    }));
                    C.emitters[this.api] = true;
                }
            }
            loadAsync() {
                return __awaiter(this, void 0, void 0, function* () {
                    this._mid = yield createMiddleware(mids, 0, this.api);
                });
            }
            runInternal(context) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._mid !== undefined) {
                        yield this._mid.execute(context);
                    }
                });
            }
        },
        _a.emitters = {},
        _a;
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