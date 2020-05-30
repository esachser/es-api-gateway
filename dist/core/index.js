"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = exports.connectMiddlewares = exports.connect2Mids = exports.createMiddleware = exports.applyMixins = void 0;
// import workerpool from 'workerpool';
var lodash_1 = __importDefault(require("lodash"));
var middlewares_1 = require("../middlewares");
var transports_1 = require("../transports");
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            var desc = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
            var derivedDesc = Object.getOwnPropertyDescriptor(derivedCtor.prototype, name);
            if (desc !== undefined && derivedDesc === undefined) {
                Object.defineProperty(derivedCtor.prototype, name, desc);
            }
        });
    });
}
exports.applyMixins = applyMixins;
;
// Rodar em um pool de trabalhadores os middlewares
// const pool = workerpool.pool();
// import workertr from 'worker_threads';
// export async function runMiddlewares(mid: IEsMiddleware | undefined, ctx: IEsContext) {
//     if (mid !== undefined) {
//         await pool.exec(mid.execute, [ctx]);
//     }
// }
function createMiddleware(arr, idx) {
    if (idx >= arr.length) {
        return undefined;
    }
    var type = lodash_1.default.get(arr[idx], 'type');
    var data = lodash_1.default.get(arr[idx], 'data');
    var ctor = middlewares_1.getMiddlewareConstructor(type);
    if (ctor !== undefined) {
        return new ctor(data, createMiddleware(arr, idx + 1));
    }
    return createMiddleware(arr, idx + 1);
}
exports.createMiddleware = createMiddleware;
function connect2Mids(mid1, mid2) {
    var mid = mid1;
    while (mid.next !== undefined)
        mid = mid.next;
    mid.next = mid2;
}
exports.connect2Mids = connect2Mids;
function connectMiddlewares() {
    var middlewares = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        middlewares[_i] = arguments[_i];
    }
    var mid = undefined;
    if (middlewares.length > 0) {
        mid = middlewares[0];
        var i = 1;
        while (mid === undefined) {
            mid = middlewares[i];
            i++;
        }
        for (; i < middlewares.length; i++) {
            var md = middlewares[i];
            if (md !== undefined) {
                connect2Mids(mid, md);
            }
        }
    }
    return mid;
}
exports.connectMiddlewares = connectMiddlewares;
function createTransport(type, parameters, middleware) {
    var ctor = transports_1.getTransportConstructor(type);
    if (ctor !== undefined) {
        return new ctor(parameters, middleware);
    }
    return undefined;
}
exports.createTransport = createTransport;
//# sourceMappingURL=index.js.map