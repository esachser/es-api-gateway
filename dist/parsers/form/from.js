"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs_1 = __importDefault(require("qs"));
// TODO: Adicionar opções aqui
const EsFormFrom = {
    transformAnyToBuffer(input, opts) {
        return Promise.resolve(Buffer.from(qs_1.default.stringify(input, opts)));
    }
};
exports.default = EsFormFrom;
//# sourceMappingURL=from.js.map