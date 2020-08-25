import { Logger } from 'winston';
export declare function applyMixins(derivedCtor: any, baseCtors: any[]): void;
export interface IEsContext {
    properties: {
        [id: string]: any;
    };
    body?: string;
    logger: Logger;
    meta: {
        api: string;
        transport: string;
        uid: string;
    };
}
