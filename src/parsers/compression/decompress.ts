import { IEsBufferToBuffer } from '../../core/parsers';
import _ from 'lodash';
import zlib from 'zlib';

function gunzip(input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gunzip(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

function inflateRaw (input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.inflateRaw(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

function brotliDecompress (input: Buffer, opts: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.brotliDecompress(input, opts, (err, res) => {
            if (err) {
                return reject(err);
            }

            return resolve(res);
        })
    });
}

const EsDecompress: IEsBufferToBuffer = {
    transformBufferToBuffer(input: Buffer, opts?:any) {
        const encoding = _.toLower(_.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch(encoding) {
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
}

export default EsDecompress;