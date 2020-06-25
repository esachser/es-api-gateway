import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';
import qs from 'qs';

// TODO: Adicionar opções aqui

const EsFormFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        return Promise.resolve(Buffer.from(qs.stringify(input, opts)));
    }
}

export default EsFormFrom;
