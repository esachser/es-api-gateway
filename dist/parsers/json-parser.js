"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = __importDefault(require("stream"));
const lodash_1 = __importDefault(require("lodash"));
class JSONParserTransform extends stream_1.default.Transform {
    constructor(opts) {
        var _a;
        super(lodash_1.default.merge(opts !== null && opts !== void 0 ? opts : {}, { objectMode: true, writableObjectMode: true, readableObjectMode: false }));
        this._buff = [];
        this._encoding = (_a = opts === null || opts === void 0 ? void 0 : opts.encoding) !== null && _a !== void 0 ? _a : 'utf8';
    }
    _transform(data, encoding, callback) {
        if (data instanceof Buffer) {
            this._buff.push(data);
        }
        else if (data instanceof String) {
            this._buff.push(Buffer.from(data));
        }
        else {
            return callback(null, data);
        }
        if (this.readableLength === 0) {
            const objStr = Buffer.concat(this._buff).toString(this._encoding);
            if (objStr.length === 0) {
                return callback(null, undefined);
            }
            const obj = JSON.parse(objStr);
            return callback(null, obj);
        }
    }
}
const EsJsonParser = {
    decode: (opts) => new JSONParserTransform(opts),
    encode: (opts) => new stream_1.default.PassThrough()
};
exports.default = EsJsonParser;
//# sourceMappingURL=json-parser.js.map