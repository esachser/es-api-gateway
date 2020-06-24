"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParsers = void 0;
const parsers_1 = require("../core/parsers");
const from_1 = __importDefault(require("./json/from"));
const to_1 = __importDefault(require("./json/to"));
const compress_1 = __importDefault(require("./compression/compress"));
const decompress_1 = __importDefault(require("./compression/decompress"));
const to_2 = __importDefault(require("./string/to"));
const from_2 = __importDefault(require("./string/from"));
const from_3 = __importDefault(require("./form/from"));
const to_3 = __importDefault(require("./form/to"));
const from_4 = __importDefault(require("./xml/from"));
const to_4 = __importDefault(require("./xml/to"));
function loadParsers() {
    parsers_1.addAnyToBuffer('EsJson', from_1.default);
    parsers_1.addBufferToAny('EsJson', to_1.default);
    parsers_1.addAnyToBuffer('EsString', from_2.default);
    parsers_1.addBufferToAny('EsString', to_2.default);
    parsers_1.addAnyToBuffer('EsForm', from_3.default);
    parsers_1.addBufferToAny('EsForm', to_3.default);
    parsers_1.addAnyToBuffer('EsXml', from_4.default);
    parsers_1.addBufferToAny('EsXml', to_4.default);
    parsers_1.addBufferToBuffer('EsCompress', compress_1.default);
    parsers_1.addBufferToBuffer('EsDecompress', decompress_1.default);
}
exports.loadParsers = loadParsers;
//# sourceMappingURL=index.js.map