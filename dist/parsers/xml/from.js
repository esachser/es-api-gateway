"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_xml_parser_1 = __importDefault(require("fast-xml-parser"));
const EsXmlFrom = {
    transformAnyToBuffer(input, opts) {
        const parser = new fast_xml_parser_1.default.j2xParser(opts);
        return Promise.resolve(Buffer.from(parser.parse(input)));
    }
};
exports.default = EsXmlFrom;
//# sourceMappingURL=from.js.map