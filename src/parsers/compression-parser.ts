import zlib from 'zlib';
import stream from 'stream';
import { IEsParser } from '../core/parsers';
import _ from 'lodash';

const EsCompressionParser: IEsParser =  {
    decode(opts?:any) {
        const encoding = _.toLower(_.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch(encoding) {
            case 'gzip':
                return zlib.createGunzip(opts)
            case 'deflate':
                return zlib.createInflateRaw(opts)
            case 'br':
                return zlib.createBrotliDecompress(opts);
            default:
                return new stream.PassThrough();
        }
    },
    encode(opts?:any) {
        const encoding = _.toLower(_.get(opts, 'encoding', 'identity'));
        delete opts.encoding;
        switch(encoding) {
            case 'gzip':
                return zlib.createGzip(opts)
            case 'deflate':
                return zlib.createDeflateRaw(opts)
            case 'br':
                return zlib.createBrotliCompress(opts);
            default:
                return new stream.PassThrough();
        }
    }
};

export default EsCompressionParser;
