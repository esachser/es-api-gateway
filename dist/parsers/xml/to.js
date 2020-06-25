"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const EsXmlTo = {
    transformBufferToAny(input, opts) {
        var _a;
        const encoding = (_a = opts === null || opts === void 0 ? void 0 : opts.encoding) !== null && _a !== void 0 ? _a : 'utf8';
        return Promise.resolve(fast_xml_parser_1.default.parse(input.toString(encoding), opts));
    }
};
exports.default = EsXmlTo;
//# sourceMappingURL=to.js.map