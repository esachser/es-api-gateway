import { IEsBufferToAny, IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';

const EsJsonTo: IEsBufferToAny = {
    transformBufferToAny(input: Buffer, opts?:any) {
        const encoding = opts?.encoding ?? 'utf8';
        return Promise.resolve(JSON.parse(input.toString(encoding)));
    }
}

export default EsJsonTo;
