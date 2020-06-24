import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';

const EsJsonFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        return Promise.resolve(Buffer.from(JSON.stringify(input)));
    }
}

export default EsJsonFrom;
