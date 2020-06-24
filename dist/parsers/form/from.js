"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = __importDefault(require("querystring"));
// TODO: Adicionar opções aqui
const EsFormFrom = {
    transformAnyToBuffer(input, opts) {
        return Promise.resolve(Buffer.from(querystring_1.default.encode(input)));
    }
};
exports.default = EsFormFrom;
//# sourceMappingURL=from.js.map