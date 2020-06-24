import { logger } from "../util/logger";
import stream from 'stream';
import util from 'util';
import _ from "lodash";
import getRawBody from "raw-body";

// const pipeline = util.promisify(stream.pipeline);

// export interface IEsParser {
//     decode(opts?: any): stream.Duplex
//     encode(opts?: any): stream.Duplex
// }

// const parsers: { [id: string]: IEsParser } = { };

// export function addParser(type: string, parser: IEsParser) {
//     try {
//         logger.info(`Loading ${type} Parser`);
//         parsers[type] = parser;
//     }
//     catch (err) {
//         logger.error(`Error loading middleware ${type} -- `, err);
//     }
// }

// export function decodeToObject(data: NodeJS.ReadableStream | Buffer | undefined, ...parsersDefs: Array<{ parser: string, opts?: any }>): Promise<any> {
//     if (data === undefined) {
//         return Promise.resolve(data);
//     }
//     if (data instanceof Buffer) {
//         if (data.length === 0) {
//             return Promise.resolve(undefined);
//         }
//         data = stream.Readable.from(data) as NodeJS.ReadableStream;
//     }
//     const ndata = data;
//     return new Promise((resolve, reject) => {
//         try { 
//             let st = ndata;
//             if (parsersDefs.length > 0) {
//                 for (const p of parsersDefs) {
//                     const parser = parsers[p.parser];
//                     if (parser === undefined) {
//                         throw Error('No parser found');
//                     }
//                     else {
//                         st = st.pipe(parser.decode(p.opts));
//                     }
//                 }
//             }
//             let result: any = {};

//             st.on('aborted', err => {
//                 reject(err);
//             });

//             st.on('close', err => {
//                 st.removeAllListeners('aborted');
//                 st.removeAllListeners('close');
//                 st.removeAllListeners('error');
//                 st.removeAllListeners('data');
//                 st.removeAllListeners('end');
//             });

//             st.on('error', err => {
//                 reject(err);
//             });

//             st.on('data', data => {
//                 result = data;
//             });

//             st.on('end', data => {
//                 resolve(result);
//             });            
//         }
//         catch (err) {
//             reject(err);
//         }
//     });
// }


// export function encodeToStream(data: NodeJS.ReadableStream | Buffer | String | undefined, ...parsersDefs: Array<{ parser: string, opts?: any }>) {
//     if (_.isUndefined(data)) {
//         return data;
//     }

//     let st: stream.Readable;

//     if (_.isBuffer(data)) {
//         st = stream.Readable.from(data);
//     }
//     else if (_.isString(data)) {
//         st = stream.Readable.from(data);
//     }
//     else {
//         st = data as stream.Readable;
//     }
    
//     if (parsersDefs.length > 0) {
//         for (const p of parsersDefs) {
//             const parser = parsers[p.parser];
//             if (parser === undefined) {
//                 throw Error('No parser found');
//             }
//             else {
//                 st = st.pipe(parser.encode(p.opts));
//             }
//         }
//     }

//     return getRawBody(st);
// }


export interface IEsAnyToBuffer {
    transformAnyToBuffer(input: any, opts?: any): Promise<Buffer>
}
const anyToBuffer: Map<string, IEsAnyToBuffer> = new Map;
export function addAnyToBuffer(type: string, parser: IEsAnyToBuffer) {
    try {
        logger.info(`Loading ${type} Parser`);
        anyToBuffer.set(type, parser);
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

export interface IEsBufferToAny {
    transformBufferToAny(input: Buffer, opts?: any): Promise<any>
}
const bufferToAny: Map<string, IEsBufferToAny> = new Map;
export function addBufferToAny(type: string, parser: IEsBufferToAny) {
    try {
        logger.info(`Loading ${type} Parser`);
        bufferToAny.set(type, parser);
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

export interface IEsBufferToBuffer {
    transformBufferToBuffer(input: Buffer, opts?: any): Promise<Buffer>
}
const bufferToBuffer: Map<string, IEsBufferToBuffer> = new Map;
export function addBufferToBuffer(type: string, parser: IEsBufferToBuffer) {
    try {
        logger.info(`Loading ${type} Parser`);
        bufferToBuffer.set(type, parser);
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

type ParserOptions = { parser: string, opts?: any };

export async function transform(input: Buffer | String | any, parsers: { atb: ParserOptions, btb?: ParserOptions[], bta?: ParserOptions } | { atb?: ParserOptions, btb?: ParserOptions[], bta: ParserOptions } | { atb?: ParserOptions, btb: ParserOptions[], bta?: ParserOptions }) {
     
    if (_.isUndefined(input)) {
        return undefined;
    }

    const atbOptions = parsers.atb;
    const btbOptions = parsers.btb;
    const btaOptions = parsers.bta;

    const atb = anyToBuffer.get(atbOptions?.parser ?? '');
    const bta = bufferToAny.get(btaOptions?.parser ?? '');

    if (!_.isUndefined(atbOptions) && _.isUndefined(atb)) {
        throw Error('AnyToBuffer not exists');
    }

    if (!_.isUndefined(btaOptions) && _.isUndefined(bta)) {
        throw Error('BufferToAny not exists');
    }

    let ipt = input;

    if (_.isString(input)){
        ipt = Buffer.from(input);
    }

    if (!_.isBuffer(ipt) && _.isUndefined(atb)) {
        throw Error('AnyToBuffer MUST be defined');
    }

    if (!_.isUndefined(atb)) {
        ipt = await atb.transformAnyToBuffer(ipt, atbOptions?.opts);
    }

    if (!_.isUndefined(btbOptions)) {
        for (const btbopt of btbOptions) {
            const btb = bufferToBuffer.get(btbopt.parser);
            if (_.isUndefined(btb)) {
                throw Error(`BufferToBuffer ${btbopt.parser} not exists`);
            }

            ipt = await btb.transformBufferToBuffer(ipt, btbopt.opts);
        }
    }

    if (!_.isUndefined(bta)) {
        ipt = await bta.transformBufferToAny(ipt, btaOptions?.opts);
    }

    return ipt;
}

export default {
    transform
};
