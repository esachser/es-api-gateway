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
exports.MiddlewareSchema = exports.MiddlewareCtor = exports.EsExecJsMiddleware = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const vm_1 = __importDefault(require("vm"));
const errors_1 = require("../core/errors");
const vmContext = vm_1.default.createContext({
    '_': lodash_1.default,
    ctx: {},
    result: Error('result not set')
}, {
    name: 'ExecJs Middleware'
});
let EsExecJsMiddleware = /** @class */ (() => {
    class EsExecJsMiddleware extends core_1.EsMiddleware {
        /**
         * Constrói o middleware a partir dos parâmetros
         */
        constructor(values, after, nextMiddleware) {
            super(after, nextMiddleware);
            // Verifica values contra o esquema.
            this.values = values;
            // Se for uma expressão, prepara VMScript para rodar.
            const script = String(lodash_1.default.get(values, 'script', ''));
            try {
                this.vmScript = new vm_1.default.Script(script);
            }
            catch (err) {
                throw new errors_1.EsMiddlewareError(EsExecJsMiddleware.middlewareName, 'Error compiling ExecJs script', err);
            }
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () { });
        }
        runInternal(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.vmScript !== undefined) {
                    context.logger.debug(`Running script`, lodash_1.default.merge({}, EsExecJsMiddleware.meta, context.meta));
                    vmContext.ctx = context;
                    this.vmScript.runInContext(vmContext);
                }
            });
        }
    }
    EsExecJsMiddleware.isInOut = true;
    EsExecJsMiddleware.middlewareName = 'EsExecJsMiddleware';
    EsExecJsMiddleware.meta = { middleware: EsExecJsMiddleware.middlewareName };
    return EsExecJsMiddleware;
})();
exports.EsExecJsMiddleware = EsExecJsMiddleware;
;
exports.MiddlewareCtor = EsExecJsMiddleware;
exports.MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsExecJsMiddleware",
    "title": "ExecJs Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "script"
    ],
    "properties": {
        "script": {
            "type": "string"
        }
    }
};
//# sourceMappingURL=execjs-middleware.js.map