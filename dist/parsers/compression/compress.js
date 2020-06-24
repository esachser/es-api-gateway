"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const zlib_1 = __importDefault(require("zlib"));
function gzip(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.gzip(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
function deflateRaw(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.deflateRaw(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
function brotliCompress(input, opts) {
    return new Promise((resolve, reject) => {
        zlib_1.default.brotliCompress(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}
const EsCompress = {
    transformBufferToBuffer(input, opts) {
        const encoding = lodash_1.default.toLower(lodash_1.default.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch (encoding) {
            case 'gzip':
                return gzip(input, opts);
            case 'deflate':
                return deflateRaw(input, opts);
            case 'br':
                return brotliCompress(input, opts);
            default:
                return Promise.resolve(input);
        }
    }
};
exports.default = EsCompress;
//# sourceMappingURL=compress.js.map