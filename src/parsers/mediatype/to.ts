import { IEsBufferToAny } from '../../core/parsers';
import _ from 'lodash';

const mediaTypeParsersToExact: {[id:string]: IEsBufferToAny} = {};
const mediaTypeParsersTo: {[id:string]: IEsBufferToAny} = {};

export function addMediaTypeParserToExact(mediaType: string, parser: IEsBufferToAny) {
    mediaTypeParsersToExact[mediaType] = parser;
}

export function addMediaTypeParserToGeneral(mediaType: string, parser: IEsBufferToAny) {
    mediaTypeParsersTo[mediaType] = parser;
}

function findMediaTypeExact(mediaType: string): IEsBufferToAny | undefined {
    for(const key in mediaTypeParsersToExact) {
        if (mediaType === key) {
            return mediaTypeParsersToExact[key];
        }
    }
    return undefined;
}

function findMediaType(mediaType: string): IEsBufferToAny | undefined {
    const exact = findMediaTypeExact(mediaType);
    if (exact) {
        return exact;
    }

    for(const key in mediaTypeParsersTo) {
        if (mediaType.includes(key)) {
            return mediaTypeParsersTo[key];
        }
    }
    return undefined;
}

const EsMediaTypeTo: IEsBufferToAny = {
    transformBufferToAny(input: Buffer, opts?:any) {
        const mediaType = opts?.mediaType;
        if (_.isString(mediaType)) {
            // Tenta encontrar exact match
            const iesbta = findMediaType(mediaType);
            if (!_.isUndefined(iesbta)) {
                return iesbta.transformBufferToAny(input, opts);
            }
        }
        // Caso não tenha dado nada certo, retorna o próprio buffer
        return Promise.resolve(input);
    }
}

export default EsMediaTypeTo;
