import JSONStream from 'JSONStream';
import { IEsParser } from '../core/parsers';
import stream from 'stream';
import _ from 'lodash';

class JSONParserTransform extends stream.Transform {

    private _buff: Array<Buffer>;
    private _encoding: BufferEncoding;

    constructor(opts?: stream.TransformOptions & {encoding?: BufferEncoding} | undefined ) {
        super(_.merge(opts ?? {}, { objectMode: true, writableObjectMode: true, readableObjectMode:false }));
        this._buff = [];
        this._encoding = opts?.encoding ?? 'utf8';
    }

    _transform(data: Buffer | string | any, encoding: BufferEncoding, callback: stream.TransformCallback) {
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

const EsJsonParser: IEsParser = {
    decode: (opts?: any) => new JSONParserTransform(opts),
    encode: JSONStream.stringify
}

export default EsJsonParser;
