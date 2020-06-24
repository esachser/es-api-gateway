import { IEsBufferToBuffer } from '../../core/parsers';
import _ from 'lodash';
import zlib from 'zlib';

function gzip(input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gzip(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

function deflateRaw (input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.deflateRaw(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

function brotliCompress (input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.brotliCompress(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

const EsCompress: IEsBufferToBuffer = {
    transformBufferToBuffer(input: Buffer, opts?:any) {
        const encoding = _.toLower(_.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch(encoding) {
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
}

export default EsCompress;
