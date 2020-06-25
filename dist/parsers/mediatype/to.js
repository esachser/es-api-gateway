"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMediaTypeParserToGeneral = exports.addMediaTypeParserToExact = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mediaTypeParsersToExact = {};
const mediaTypeParsersTo = {};
function addMediaTypeParserToExact(mediaType, parser) {
    mediaTypeParsersToExact[mediaType] = parser;
}
exports.addMediaTypeParserToExact = addMediaTypeParserToExact;
function addMediaTypeParserToGeneral(mediaType, parser) {
    mediaTypeParsersTo[mediaType] = parser;
}
exports.addMediaTypeParserToGeneral = addMediaTypeParserToGeneral;
function findMediaTypeExact(mediaType) {
    for (const key in mediaTypeParsersToExact) {
        if (mediaType === key) {
            return mediaTypeParsersToExact[key];
        }
    }
    return undefined;
}
function findMediaType(mediaType) {
    const exact = findMediaTypeExact(mediaType);
    if (exact) {
        return exact;
    }
    for (const key in mediaTypeParsersTo) {
        if (mediaType.includes(key)) {
            return mediaTypeParsersTo[key];
        }
    }
    return undefined;
}
const EsMediaTypeTo = {
    transformBufferToAny(input, opts) {
        const mediaType = opts === null || opts === void 0 ? void 0 : opts.mediaType;
        if (lodash_1.default.isString(mediaType)) {
            // Tenta encontrar exact match
            const iesbta = findMediaType(mediaType);
            if (!lodash_1.default.isUndefined(iesbta)) {
                return iesbta.transformBufferToAny(input, opts);
            }
        }
        // Caso não tenha dado nada certo, retorna o próprio buffer
        return Promise.resolve(input);
    }
};
exports.default = EsMediaTypeTo;
//# sourceMappingURL=to.js.map