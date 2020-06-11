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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsPropertyMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const vm2_1 = require("vm2");
const logger_1 = require("../util/logger");
const stringify_object_1 = __importDefault(require("stringify-object"));
const vm = new vm2_1.NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        external: true,
        root: "./"
    }
});
let EsPropertyMiddleware = /** @class */ (() => {
    class EsPropertyMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            // Verifica values contra o esquema.
            this.values = values;
            // Se for uma expressão, prepara VMScript para rodar.
            let script = '';
            if (values['value'] === undefined &&
                values['expression'] !== undefined) {
                script = `const lodash=require('lodash');module.exports=function(ctx){ return ${values['expression']}; }`;
            }
            // Senão, prepara VMScript para somente devolver o valor
            else {
                script = `const lodash=require('lodash');module.exports=function(ctx){ return ${stringify_object_1.default(values['value'])}; }`;
            }
            try {
                this.vmScript = new vm2_1.VMScript(script).compile();
            }
            catch (err) {
                logger_1.logger.error('Error compiling script', { error: err, script });
                this.vmScript = new vm2_1.VMScript('module.exports=() => undefined').compile();
            }
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    lodash_1.default.set(context.properties, this.values['name'], vm.run(this.vmScript)(context));
                }
                catch (err) {
                    logger_1.logger.error('Error while setting property', err);
                }
            });
        }
    }
    EsPropertyMiddleware.isInOut = true;
    return EsPropertyMiddleware;
})();
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
        "name"
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