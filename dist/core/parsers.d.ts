/// <reference types="node" />
export interface IEsParser {
    decode(opts?: any): NodeJS.ReadWriteStream;
    encode(opts?: any): NodeJS.ReadWriteStream;
}
export declare function addParser(type: string, parser: IEsParser): void;
export declare function decodeToObject(data: NodeJS.ReadableStream, ...parsersDefs: Array<{
    parser: string;
    opts?: any;
}>): Promise<any>;
export declare function encodeToStream(data: NodeJS.ReadableStream, ...parsersDefs: Array<{
    parser: string;
    opts?: any;
}>): NodeJS.ReadableStream;
