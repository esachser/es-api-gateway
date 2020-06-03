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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsPropertyMiddleware = void 0;
var lodash_1 = __importDefault(require("lodash"));
var vm2_1 = require("vm2");
var logger_1 = require("../util/logger");
var stringify_object_1 = __importDefault(require("stringify-object"));
var vm = new vm2_1.NodeVM();
var EsPropertyMiddleware = /** @class */ (function () {
    /**
     * Constrói o middleware a partir dos parâmetros
     */
    function EsPropertyMiddleware(values, nextMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;
        // Se for uma expressão, prepara VMScript para rodar.
        var script = '';
        if (values['value'] === undefined &&
            values['expression'] !== undefined) {
            script += "module.exports=function(props){ try { return " + values['expression'] + ";} catch(err) { return undefined; } }";
        }
        // Senão, prepara VMScript para somente devolver o valor
        else {
            script += "module.exports=function(props){ try { return " + stringify_object_1.default(values['value']) + ";} catch(err) { return undefined; } }";
        }
        logger_1.logger.debug("script: " + script);
        try {
            this.vmScript = new vm2_1.VMScript(script).compile();
        }
        catch (err) {
            logger_1.logger.error({ error: err, script: script });
            this.vmScript = new vm2_1.VMScript('module.exports=() => undefined').compile();
        }
    }
    EsPropertyMiddleware.prototype.execute = function (context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var runAfter;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        runAfter = lodash_1.default.get(this.values, 'runAfter') || false;
                        vm.freeze(context.properties, 'props');
                        if (!runAfter) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this.next) === null || _a === void 0 ? void 0 : _a.execute(context))];
                    case 1:
                        _c.sent();
                        lodash_1.default.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
                        return [3 /*break*/, 4];
                    case 2:
                        lodash_1.default.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
                        return [4 /*yield*/, ((_b = this.next) === null || _b === void 0 ? void 0 : _b.execute(context))];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EsPropertyMiddleware.isInOut = true;
    return EsPropertyMiddleware;
}());
exports.EsPropertyMiddleware = EsPropertyMiddleware;
;
exports.MiddlewareCtor = EsPropertyMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsPropertyMiddleware",
    "title": "Property Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "name",
        "runAfter"
    ],
    "properties": {
        "name": {
            "type": "string"
        },
        "value": {
            "type": ["object", "number", "boolean", "string", "null"]
        },
        "expression": {
            "type": "string"
        },
        "runAfter": {
            "type": "boolean"
        }
    },
    "oneOf": [
        {
            "required": [
                "value"
            ]
        },
        {
            "required": [
                "expression"
            ]
        }
    ]
};
//# sourceMappingURL=property-middleware.js.map