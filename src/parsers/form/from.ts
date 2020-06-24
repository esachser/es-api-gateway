import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';
import qs from 'querystring';

// TODO: Adicionar opções aqui

const EsFormFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        return Promise.resolve(Buffer.from(qs.encode(input)));
    }
}

export default EsFormFrom;
