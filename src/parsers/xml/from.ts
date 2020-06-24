import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';
import XMLParser from 'fast-xml-parser';

const EsXmlFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        const parser = new XMLParser.j2xParser(opts);
        return Promise.resolve(Buffer.from(parser.parse(input)));
    }
}

export default EsXmlFrom;
