import { IEsAnyToBuffer } from '../../core/parsers';
import _ from 'lodash';

const mediaTypeParsersFromExact: {[id:string]: IEsAnyToBuffer} = {};
const mediaTypeParsersFrom: {[id:string]: IEsAnyToBuffer} = {};

export function addMediaTypeParserFromExact(mediaType: string, parser: IEsAnyToBuffer) {
    mediaTypeParsersFromExact[mediaType] = parser;
}

export function addMediaTypeParserFromGeneral(mediaType: string, parser: IEsAnyToBuffer) {
    mediaTypeParsersFrom[mediaType] = parser;
}

function findMediaTypeExact(mediaType: string): IEsAnyToBuffer | undefined {
    for(const key in mediaTypeParsersFromExact) {
        if (mediaType === key) {
            return mediaTypeParsersFromExact[key];
        }
    }
    return undefined;
}

function findMediaType(mediaType: string): IEsAnyToBuffer | undefined {
    const exact = findMediaTypeExact(mediaType);
    if (exact) {
        return exact;
    }

    for(const key in mediaTypeParsersFrom) {
        if (mediaType.includes(key)) {
            return mediaTypeParsersFrom[key];
        }
    }
    return undefined;
}

const EsMediaTypeFrom: IEsAnyToBuffer = {
    transformAnyToBuffer(input: any, opts?:any) {
        const mediaType = opts?.mediaType;
        if (_.isString(mediaType)) {
            // Tenta encontrar exact match
            const iesbta = findMediaType(mediaType);
            if (!_.isUndefined(iesbta)) {
                return iesbta.transformAnyToBuffer(input, opts);
            }
        }
        // Caso não tenha dado nada certo, gera erro
        return Promise.resolve(input);
    }
}

export default EsMediaTypeFrom;
