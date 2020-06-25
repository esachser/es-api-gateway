"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
// TODO: Adicionar opções aqui
const EsFormTo = {
    transformBufferToAny(input, opts) {
        var _a;
        const encoding = (_a = opts === null || opts === void 0 ? void 0 : opts.encoding) !== null && _a !== void 0 ? _a : 'utf8';
        return Promise.resolve(qs_1.default.parse(input.toString(encoding), opts));
    }
};
exports.default = EsFormTo;
//# sourceMappingURL=to.js.map