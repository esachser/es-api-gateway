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
exports.createTransport = exports.connectMiddlewares = exports.connect2Mids = exports.createMiddleware = exports.EsMiddleware = exports.applyMixins = void 0;
// import workerpool from 'workerpool';
const lodash_1 = __importDefault(require("lodash"));
const middlewares_1 = require("./middlewares");
const transports_1 = require("./transports");
const schemas_1 = require("./schemas");
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            const desc = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
            const derivedDesc = Object.getOwnPropertyDescriptor(derivedCtor.prototype, name);
            if (desc !== undefined && derivedDesc === undefined) {
                Object.defineProperty(derivedCtor.prototype, name, desc);
            }
        });
    });
}
exports.applyMixins = applyMixins;
;
class EsMiddleware {
    constructor(after, nextMiddleware) {
        this.after = after;
        this.next = nextMiddleware;
    }
    execute(context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
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
function createMiddleware(arr, idx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (idx >= arr.length) {
            return undefined;
        }
        const type = lodash_1.default.get(arr[idx], 'type');
        const data = lodash_1.default.get(arr[idx], 'data');
        const after = lodash_1.default.get(arr[idx], 'after', false);
        const ctor = middlewares_1.getMiddlewareConstructor(type);
        const v = yield schemas_1.validateObject(type, data);
        if (ctor !== undefined && v) {
            const mid = new ctor(data, Boolean(after), yield createMiddleware(arr, idx + 1));
            yield mid.loadAsync(data);
            return mid;
        }
        return createMiddleware(arr, idx + 1);
    });
}
exports.createMiddleware = createMiddleware;
function connect2Mids(mid1, mid2) {
    let mid = mid1;
    while (mid.next !== undefined)
        mid = mid.next;
    mid.next = mid2;
}
exports.connect2Mids = connect2Mids;
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
function createTransport(type, parameters, middleware) {
    return __awaiter(this, void 0, void 0, function* () {
        const ctor = transports_1.getTransportConstructor(type);
        const v = yield schemas_1.validateObject(type, parameters);
        if (ctor !== undefined && v) {
            const transport = new ctor(parameters, middleware);
            yield transport.loadAsync(parameters);
            return transport;
        }
        return undefined;
    });
}
exports.createTransport = createTransport;
//# sourceMappingURL=index.js.map