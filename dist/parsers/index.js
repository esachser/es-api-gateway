"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const to_5 = __importStar(require("./mediatype/to"));
function loadParsers() {
    parsers_1.addAnyToBuffer('EsJson', from_1.default);
    parsers_1.addBufferToAny('EsJson', to_1.default);
    parsers_1.addAnyToBuffer('EsString', from_2.default);
    parsers_1.addBufferToAny('EsString', to_2.default);
    parsers_1.addAnyToBuffer('EsForm', from_3.default);
    parsers_1.addBufferToAny('EsForm', to_3.default);
    parsers_1.addAnyToBuffer('EsXml', from_4.default);
    parsers_1.addBufferToAny('EsXml', to_4.default);
    parsers_1.addBufferToAny('EsMediaType', to_5.default);
    to_5.addMediaTypeParserToExact('application/xml', to_4.default);
    to_5.addMediaTypeParserToGeneral('xml', to_4.default);
    to_5.addMediaTypeParserToGeneral('form-urlencoded', to_3.default);
    to_5.addMediaTypeParserToGeneral('json', to_1.default);
    parsers_1.addBufferToBuffer('EsCompress', compress_1.default);
    parsers_1.addBufferToBuffer('EsDecompress', decompress_1.default);
}
exports.loadParsers = loadParsers;
//# sourceMappingURL=index.js.map