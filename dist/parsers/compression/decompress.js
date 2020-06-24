"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const zlib_1 = __importDefault(require("zlib"));
function gunzip(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.gunzip(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
function inflateRaw(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.inflateRaw(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
function brotliDecompress(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.brotliDecompress(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
const EsDecompress = {
    transformBufferToBuffer(input, opts) {
        const encoding = lodash_1.default.toLower(lodash_1.default.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch (encoding) {
            case 'gzip':
                return gunzip(input, opts);
            case 'deflate':
                return inflateRaw(input, opts);
            case 'br':
                return brotliDecompress(input, opts);
            default:
                return Promise.resolve(input);
        }
    }
};
exports.default = EsDecompress;
//# sourceMappingURL=decompress.js.map