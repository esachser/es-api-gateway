"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadParsers = void 0;
const json_parser_1 = __importDefault(require("./json-parser"));
const parsers_1 = require("../core/parsers");
const compression_parser_1 = __importDefault(require("./compression-parser"));
function loadParsers() {
    parsers_1.addParser('EsJsonParser', json_parser_1.default);
    parsers_1.addParser('EsCompressionParser', compression_parser_1.default);
}
exports.loadParsers = loadParsers;
//# sourceMappingURL=index.js.map