import { logger } from "../util/logger";
import stream from 'stream';
import util from 'util';
import JSONStream from 'JSONStream';
import _ from "lodash";
import zlib from 'zlib';

const pipeline = util.promisify(stream.pipeline);

export interface IEsParser {
    decode(opts?: any): NodeJS.ReadWriteStream
    encode(opts?: any): NodeJS.ReadWriteStream
}

const parsers: { [id: string]: IEsParser } = { };

export function addParser(type: string, parser: IEsParser) {
    try {
        logger.info(`Loading ${type} Parser`);
        parsers[type] = parser;
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

export function decodeToObject(data: NodeJS.ReadableStream | Buffer | undefined, ...parsersDefs: Array<{ parser: string, opts?: any }>): Promise<any> {
    if (data === undefined) {
        return Promise.resolve(data);
    }
    if (data instanceof Buffer) {
        if (data.length === 0) {
            return Promise.resolve(undefined);
        }
        data = stream.Readable.from(data) as NodeJS.ReadableStream;
    }
    const ndata = data;
    return new Promise((resolve, reject) => {
        try { 
            let st = ndata;
            if (parsersDefs.length > 0) {
                for (const p of parsersDefs) {
                    const parser = parsers[p.parser];
                    if (parser === undefined) {
                        throw Error('No parser found');
                    }
                    else {
                        st = st.pipe(parser.decode(p.opts));
                    }
                }
            }
            let result: any = {};

            st.on('aborted', err => {
                reject(err);
            });

            st.on('close', err => {
                st.removeAllListeners('aborted');
                st.removeAllListeners('close');
                st.removeAllListeners('error');
                st.removeAllListeners('data');
                st.removeAllListeners('end');
            });

            st.on('error', err => {
                reject(err);
            });

            st.on('data', data => {
                result = data;
            });

            st.on('end', data => {
                resolve(result);
            });            
        }
        catch (err) {
            reject(err);
        }
    });
}


export function encodeToStream(data: NodeJS.ReadableStream | Buffer | undefined, ...parsersDefs: Array<{ parser: string, opts?: any }>) {
    if (data === undefined) {
        return data;
    }
    if (data instanceof Buffer) {
        data = stream.Readable.from(data);
    }
    
    let st = data;
    if (parsersDefs.length > 0) {
        for (const p of parsersDefs) {
            const parser = parsers[p.parser];
            if (parser === undefined) {
                throw Error('No parser found');
            }
            else {
                st = st.pipe(parser.encode(p.opts));
            }
        }
    }

    return st;
}