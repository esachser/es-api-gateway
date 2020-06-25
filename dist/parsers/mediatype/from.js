"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMediaTypeParserFromGeneral = exports.addMediaTypeParserFromExact = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mediaTypeParsersFromExact = {};
const mediaTypeParsersFrom = {};
function addMediaTypeParserFromExact(mediaType, parser) {
    mediaTypeParsersFromExact[mediaType] = parser;
}
exports.addMediaTypeParserFromExact = addMediaTypeParserFromExact;
function addMediaTypeParserFromGeneral(mediaType, parser) {
    mediaTypeParsersFrom[mediaType] = parser;
}
exports.addMediaTypeParserFromGeneral = addMediaTypeParserFromGeneral;
function findMediaTypeExact(mediaType) {
    for (const key in mediaTypeParsersFromExact) {
        if (mediaType === key) {
            return mediaTypeParsersFromExact[key];
        }
    }
    return undefined;
}
function findMediaType(mediaType) {
    const exact = findMediaTypeExact(mediaType);
    if (exact) {
        return exact;
    }
    for (const key in mediaTypeParsersFrom) {
        if (mediaType.includes(key)) {
            return mediaTypeParsersFrom[key];
        }
    }
    return undefined;
}
const EsMediaTypeFrom = {
    transformAnyToBuffer(input, opts) {
        const mediaType = opts === null || opts === void 0 ? void 0 : opts.mediaType;
        if (lodash_1.default.isString(mediaType)) {
            // Tenta encontrar exact match
            const iesbta = findMediaType(mediaType);
            if (!lodash_1.default.isUndefined(iesbta)) {
                return iesbta.transformAnyToBuffer(input, opts);
            }
        }
        // Caso não tenha dado nada certo, gera erro
        return Promise.resolve(input);
    }
};
exports.default = EsMediaTypeFrom;
//# sourceMappingURL=from.js.map