/// <reference types="node" />
export interface IEsAnyToBuffer {
    transformAnyToBuffer(input: any, opts?: any): Promise<Buffer>;
}
export declare function addAnyToBuffer(type: string, parser: IEsAnyToBuffer): void;
export interface IEsBufferToAny {
    transformBufferToAny(input: Buffer, opts?: any): Promise<any>;
}
export declare function addBufferToAny(type: string, parser: IEsBufferToAny): void;
export interface IEsBufferToBuffer {
    transformBufferToBuffer(input: Buffer, opts?: any): Promise<Buffer>;
}
export declare function addBufferToBuffer(type: string, parser: IEsBufferToBuffer): void;
declare type ParserOptions = {
    parser: string;
    opts?: any;
};
export declare function transform(input: Buffer | String | any, parsers: {
    atb: ParserOptions;
    btb?: ParserOptions[];
    bta?: ParserOptions;
} | {
    atb?: ParserOptions;
    btb?: ParserOptions[];
    bta: ParserOptions;
} | {
    atb?: ParserOptions;
    btb: ParserOptions[];
    bta?: ParserOptions;
}): Promise<any>;
declare const _default: {
    transform: typeof transform;
};
export default _default;
