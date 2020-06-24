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


export function loadParsers() {
    addAnyToBuffer('EsJson', EsJsonFrom);
    addBufferToAny('EsJson', EsJsonTo);

    addAnyToBuffer('EsString', EsStringFrom);
    addBufferToAny('EsString', EsStringTo);

    addAnyToBuffer('EsForm', EsFormFrom);
    addBufferToAny('EsForm', EsFormTo);

    addAnyToBuffer('EsXml', EsXmlFrom);
    addBufferToAny('EsXml', EsXmlTo);

    addBufferToBuffer('EsCompress', EsCompress);
    addBufferToBuffer('EsDecompress', EsDecompress);
}