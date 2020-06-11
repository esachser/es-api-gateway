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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = exports.connectMiddlewares = exports.connect2Mids = exports.createMiddleware = exports.applyMixins = void 0;
// import workerpool from 'workerpool';
var lodash_1 = __importDefault(require("lodash"));
var middlewares_1 = require("./middlewares");
var transports_1 = require("./transports");
var schemas_1 = require("./schemas");
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
function createMiddleware(arr, idx) {
    return __awaiter(this, void 0, void 0, function () {
        var type, data, ctor, v, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (idx >= arr.length) {
                        return [2 /*return*/, undefined];
                    }
                    type = lodash_1.default.get(arr[idx], 'type');
                    data = lodash_1.default.get(arr[idx], 'data');
                    ctor = middlewares_1.getMiddlewareConstructor(type);
                    return [4 /*yield*/, schemas_1.validateObject(type, data)];
                case 1:
                    v = _c.sent();
                    if (!(ctor !== undefined && v)) return [3 /*break*/, 3];
                    _a = ctor.bind;
                    _b = [void 0, data];
                    return [4 /*yield*/, createMiddleware(arr, idx + 1)];
                case 2: return [2 /*return*/, new (_a.apply(ctor, _b.concat([_c.sent()])))()];
                case 3: return [2 /*return*/, createMiddleware(arr, idx + 1)];
            }
        });
    });
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
    return __awaiter(this, void 0, void 0, function () {
        var ctor, v;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ctor = transports_1.getTransportConstructor(type);
                    return [4 /*yield*/, schemas_1.validateObject(type, parameters)];
                case 1:
                    v = _a.sent();
                    if (ctor !== undefined && v) {
                        return [2 /*return*/, new ctor(parameters, middleware)];
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
exports.createTransport = createTransport;
//# sourceMappingURL=index.js.map