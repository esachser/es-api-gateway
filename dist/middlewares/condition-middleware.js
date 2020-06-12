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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsConditionMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const vm2_1 = require("vm2");
const errors_1 = require("../core/errors");
const vm = new vm2_1.NodeVM();
let EsConditionMiddleware = /** @class */ (() => {
    class EsConditionMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            // Verifica values contra o esquema.
            this.values = {};
            this.values['conditions'] = [];
        }
        loadAsync(values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (Array.isArray(values['conditions'])) {
                    for (let i = 0; i < values['conditions'].length; i++) {
                        const condition = values['conditions'][i];
                        if (!lodash_1.default.isString(condition.conditionExpression)) {
                            throw new errors_1.EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.conditionExpression MUST be string');
                        }
                        if (!lodash_1.default.isArray(condition.mids)) {
                            throw new errors_1.EsMiddlewareError(EsConditionMiddleware.middlewareName, 'condition.mids MUST be array');
                        }
                        const script = `module.exports=function(ctx){ try { return Boolean(${values['conditions'][i]['conditionExpression']});} catch(err) { return false; } }`;
                        const compiledScript = new vm2_1.VMScript(script).compile();
                        const conditionStructure = {};
                        conditionStructure['conditionExpression'] = compiledScript;
                        conditionStructure['mids'] = yield core_1.createMiddleware(condition.mids, 0);
                        this.values['conditions'][i] = conditionStructure;
                    }
                }
                else {
                    throw new errors_1.EsMiddlewareError(EsConditionMiddleware.middlewareName, 'conditions MUST be array');
                }
            });
        }
        runInternal(context) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const meta = lodash_1.default.merge(EsConditionMiddleware.meta, context.meta);
                if (Array.isArray(this.values['conditions'])) {
                    for (let i = 0; i < this.values['conditions'].length; i++) {
                        let condition = this.values['conditions'][i];
                        if (condition['conditionExpression'] instanceof vm2_1.VMScript) {
                            context.logger.debug(`Testing condition ${i}`, meta);
                            if (Boolean(vm.run(condition['conditionExpression'])(context))) {
                                context.logger.debug(`Condition ${i} reached`, meta);
                                yield ((_a = condition['mids']) === null || _a === void 0 ? void 0 : _a.execute(context).catch((e) => { throw e; }));
                                return;
                            }
                        }
                    }
                }
            });
        }
    }
    EsConditionMiddleware.isInOut = true;
    EsConditionMiddleware.middlewareName = 'EsConditionMiddleware';
    EsConditionMiddleware.meta = { middleware: EsConditionMiddleware.middlewareName };
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
        "conditions"
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
        }
    }
};
//# sourceMappingURL=condition-middleware.js.map