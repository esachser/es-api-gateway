import { IEsBufferToAny, IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';

const EsStringTo: IEsBufferToAny = {
    transformBufferToAny(input: Buffer, opts?:any) {
        const encoding = opts?.encoding ?? 'utf8';
        return Promise.resolve(input.toString(encoding));
    }
}

export default EsStringTo;
