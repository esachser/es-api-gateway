"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = __importDefault(require("zlib"));
const stream_1 = __importDefault(require("stream"));
const lodash_1 = __importDefault(require("lodash"));
const EsCompressionParser = {
    decode(opts) {
        const encoding = lodash_1.default.toLower(lodash_1.default.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch (encoding) {
            case 'gzip':
                return zlib_1.default.createGunzip(opts);
            case 'deflate':
                return zlib_1.default.createInflateRaw(opts);
            case 'br':
                return zlib_1.default.createBrotliDecompress(opts);
            default:
                return new stream_1.default.PassThrough();
        }
    },
    encode(opts) {
        const encoding = lodash_1.default.toLower(lodash_1.default.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch (encoding) {
            case 'gzip':
                return zlib_1.default.createGzip(opts);
            case 'deflate':
                return zlib_1.default.createDeflateRaw(opts);
            case 'br':
                return zlib_1.default.createBrotliCompress(opts);
            default:
                return new stream_1.default.PassThrough();
        }
    }
};
exports.default = EsCompressionParser;
//# sourceMappingURL=compression-parser.js.map