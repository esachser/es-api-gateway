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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsConditionMiddleware = void 0;
const core_1 = require("../core");
const vm2_1 = require("vm2");
const vm = new vm2_1.NodeVM();
let EsConditionMiddleware = /** @class */ (() => {
    class EsConditionMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, nextMiddleware) {
            // Verifica values contra o esquema.
            this.values = {};
            this.values['after'] = values['after'];
            this.values['conditions'] = [];
            this.next = nextMiddleware;
            if (Array.isArray(values['conditions'])) {
                values['conditions'].forEach((condition, i) => {
                    if (Array.isArray(condition.mids)) {
                        this.values['conditions'][i] = {};
                        const script = `module.exports=function(ctx){ try { return Boolean(${values['conditions'][i]['conditionExpression']});} catch(err) { return false; } }`;
                        this.values['conditions'][i]['conditionExpression'] = new vm2_1.VMScript(script).compile();
                        core_1.createMiddleware(condition.mids, 0).then(mid => {
                            this.values['conditions'][i]['mids'] = mid;
                        });
                    }
                });
            }
        }
        runInternal(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(this.values['conditions'])) {
                    for (let i = 0; i < this.values['conditions'].length; i++) {
                        let condition = this.values['conditions'][i];
                        if (condition['conditionExpression'] instanceof vm2_1.VMScript) {
                            if (Boolean(vm.run(condition['conditionExpression'])(context))) {
                                yield ((_a = condition['mids']) === null || _a === void 0 ? void 0 : _a.execute(context));
                                return;
                            }
                        }
                    }
                }
            });
        }
        execute(context) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const rAfter = Boolean(this.values['after']);
                if (rAfter) {
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
    EsConditionMiddleware.isInOut = true;
    return EsConditionMiddleware;
})();
exports.EsConditionMiddleware = EsConditionMiddleware;
;
exports.MiddlewareCtor = EsConditionMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsConditionMiddleware",
    "title": "Condition Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "conditions",
        "after"
    ],
    "properties": {
        "conditions": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": false,
                "required": [
                    "conditionExpression",
                    "mids"
                ],
                "properties": {
                    "conditionExpression": {
                        "type": "string"
                    },
                    "mids": {
                        "type": "array",
                        "items": {
                            "$ref": "es-middleware"
                        }
                    }
                }
            }
        },
        "after": {
            "type": "boolean"
        }
    }
};
//# sourceMappingURL=condition-middleware.js.map