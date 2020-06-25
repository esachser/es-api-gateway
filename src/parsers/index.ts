import { addAnyToBuffer, addBufferToAny, addBufferToBuffer } from "../core/parsers";
import EsJsonFrom from "./json/from";
import EsJsonTo from "./json/to";
import EsCompress from "./compression/compress";
import EsDecompress from "./compression/decompress";
import EsStringTo from "./string/to";
import EsStringFrom from "./string/from";
import EsFormFrom from "./form/from";
import EsFormTo from "./form/to";
import EsXmlFrom from "./xml/from";
import EsXmlTo from "./xml/to";
import EsMediaTypeTo, { addMediaTypeParserToExact, addMediaTypeParserToGeneral } from "./mediatype/to";
import EsMediaTypeFrom, { addMediaTypeParserFromGeneral, addMediaTypeParserFromExact } from "./mediatype/from";


export function loadParsers() {
    addAnyToBuffer('EsJson', EsJsonFrom);
    addBufferToAny('EsJson', EsJsonTo);

    addAnyToBuffer('EsString', EsStringFrom);
    addBufferToAny('EsString', EsStringTo);

    addAnyToBuffer('EsForm', EsFormFrom);
    addBufferToAny('EsForm', EsFormTo);

    addAnyToBuffer('EsXml', EsXmlFrom);
    addBufferToAny('EsXml', EsXmlTo);

    addBufferToAny('EsMediaType', EsMediaTypeTo);
    addMediaTypeParserToExact('application/xml', EsXmlTo);
    addMediaTypeParserToGeneral('xml', EsXmlTo);
    addMediaTypeParserToGeneral('form-urlencoded', EsFormTo);
    addMediaTypeParserToGeneral('json', EsJsonTo);

    addAnyToBuffer('EsMediaType', EsMediaTypeFrom);
    addMediaTypeParserFromExact('application/xml', EsXmlFrom);
    addMediaTypeParserFromGeneral('xml', EsXmlFrom);
    addMediaTypeParserFromGeneral('form-urlencoded', EsFormFrom);
    addMediaTypeParserFromGeneral('json', EsJsonFrom);

    addBufferToBuffer('EsCompress', EsCompress);
    addBufferToBuffer('EsDecompress', EsDecompress);
}