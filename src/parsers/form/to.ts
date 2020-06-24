import { IEsBufferToAny, IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';
import qs from 'querystring';

// TODO: Adicionar opções aqui

const EsFormTo: IEsBufferToAny = {
    transformBufferToAny(input: Buffer, opts?:any) {
        const encoding = opts?.encoding ?? 'utf8';
        return Promise.resolve(qs.decode(input.toString(encoding)));
    }
}

export default EsFormTo;
