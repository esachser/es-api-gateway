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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsSequenceMiddleware = void 0;
var core_1 = require("../core");
var EsSequenceMiddleware = /** @class */ (function () {
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    function EsSequenceMiddleware(values, nextMiddleware) {
        var _this = this;
        // Verifica values contra o esquema.
        this.values = {};
        this.values['runAfter'] = values['runAfter'];
        this.values['mids'] = [];
        this.next = nextMiddleware;
        if (Array.isArray(values['mids'])) {
            values['mids'].forEach(function (ms, i) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            if (!Array.isArray(ms)) return [3 /*break*/, 2];
                            _a = this.values['mids'];
                            _b = i;
                            return [4 /*yield*/, core_1.createMiddleware(ms, 0)];
                        case 1:
                            _a[_b] = _e.sent();
                            return [3 /*break*/, 4];
                        case 2:
                            _c = this.values['mids'];
                            _d = i;
                            return [4 /*yield*/, core_1.createMiddleware([ms], 0)];
                        case 3:
                            _c[_d] = _e.sent();
                            _e.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
    }
    EsSequenceMiddleware.prototype.execute = function (context) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var rAfter, i, i;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        rAfter = Boolean(this.values['runAfter']);
                        if (!!rAfter) return [3 /*break*/, 4];
                        if (!Array.isArray(this.values['mids'])) return [3 /*break*/, 4];
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < this.values['mids'].length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, ((_a = this.values['mids'][i]) === null || _a === void 0 ? void 0 : _a.execute(context))];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, ((_b = this.next) === null || _b === void 0 ? void 0 : _b.execute(context))];
                    case 5:
                        _d.sent();
                        if (!rAfter) return [3 /*break*/, 9];
                        if (!Array.isArray(this.values['mids'])) return [3 /*break*/, 9];
                        i = 0;
                        _d.label = 6;
                    case 6:
                        if (!(i < this.values['mids'].length)) return [3 /*break*/, 9];
                        return [4 /*yield*/, ((_c = this.values['mids'][i]) === null || _c === void 0 ? void 0 : _c.execute(context))];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    EsSequenceMiddleware.isInOut = true;
    return EsSequenceMiddleware;
}());
exports.EsSequenceMiddleware = EsSequenceMiddleware;
;
exports.MiddlewareCtor = EsSequenceMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsSequenceMiddleware",
    "title": "Sequence Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "mids",
        "runAfter"
    ],
    "properties": {
        "mids": {
            "type": "array",
            "items": {
                "anyOf": [
                    {
                        "$ref": "es-middleware"
                    },
                    {
                        "type": "array",
                        "items": {
                            "$ref": "es-middleware"
                        }
                    }
                ]
            }
        },
        "runAfter": {
            "type": "boolean"
        }
    }
};
//# sourceMappingURL=sequence-middleware.js.map