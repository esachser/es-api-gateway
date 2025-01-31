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
const lodash_1 = __importDefault(require("lodash"));
const vm_1 = __importDefault(require("vm"));
const stringify_object_1 = __importDefault(require("stringify-object"));
const errors_1 = require("../core/errors");
const middlewares_1 = require("../core/middlewares");
const vmContext = vm_1.default.createContext({
    '_': lodash_1.default,
    ctx: {},
    result: Error('result not set')
}, {
    name: 'Property Middleware'
});
let EsPropertyMiddleware = /** @class */ (() => {
    class EsPropertyMiddleware extends middlewares_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, api, nextMiddleware) {
            super(after, api, nextMiddleware);
            // Verifica values contra o esquema.
            this.values = values;
            // Se for uma expressão, prepara VMScript para rodar.
            let script = '';
            if (values['value'] === undefined &&
                values['expression'] !== undefined) {
                script = `'use strict';result=${values['expression']};`;
            }
            // Senão, prepara VMScript para somente devolver o valor
            else {
                script = `'use strict';result=${stringify_object_1.default(values['value'])};`;
            }
            try {
                this.vmScript = new vm_1.default.Script(script);
            }
            catch (err) {
                throw new errors_1.EsMiddlewareError(EsPropertyMiddleware.middlewareName, 'Error compiling property script', err);
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.vmScript !== undefined) {
                    //context.logger.debug(`Writing to ${this.values['name']}`, _.merge({}, EsPropertyMiddleware.meta, context.meta));
                    vmContext.ctx = context;
                    this.vmScript.runInContext(vmContext);
                    lodash_1.default.set(context.properties, this.values['name'], vmContext.result);
                }
            });
        }
    }
    EsPropertyMiddleware.isInOut = true;
    EsPropertyMiddleware.middlewareName = 'EsPropertyMiddleware';
    EsPropertyMiddleware.meta = { middleware: EsPropertyMiddleware.middlewareName };
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
            "type": ["object", "array", "number", "boolean", "string", "null"]
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