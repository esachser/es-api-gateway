import EsJsonParser from "./json-parser";
import { addParser } from "../core/parsers";
import EsCompressionParser from "./compression-parser";


export function loadParsers() {
    addParser('EsJsonParser', EsJsonParser);
    addParser('EsCompressionParser', EsCompressionParser);
}