import { IEsBufferToAny, IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';
import XMLParser from 'fast-xml-parser';

const EsXmlTo: IEsBufferToAny = {
    transformBufferToAny(input: Buffer, opts?:any) {
        const encoding = opts?.encoding ?? 'utf8';
        return Promise.resolve(XMLParser.parse(input.toString(encoding)));
    }
}

export default EsXmlTo;
