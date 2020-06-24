import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';

const EsStringFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        return Promise.resolve(Buffer.from(input));
    }
}

export default EsStringFrom;
