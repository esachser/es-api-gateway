import { logger } from "../util/logger";
import stream from 'stream';
import util from 'util';
import JSONStream from 'JSONStream';
import _ from "lodash";
import es from 'event-stream';


const pipeline = util.promisify(stream.pipeline);

export interface IEsParser {
    decode(opts?: any): NodeJS.ReadWriteStream
    encode(opts?: any): NodeJS.ReadWriteStream
}

const parsers: { [id: string]: IEsParser } = {
    'JSONParser': {
        decode: JSONStream.parse,
        encode: JSONStream.stringify
    }
};

export function addParser(type: string, parser: IEsParser) {
    try {
        logger.info(`Loading ${type} Parser`);
        parsers[type] = parser;
    }
    catch (err) {
        logger.error(`Error loading middleware ${type} -- `, err);
    }
}

export function decodeToObject(data: NodeJS.ReadableStream | Buffer, ...parsersDefs: Array<{ parser: string, opts?: any }>): Promise<any> {
    if (data instanceof Buffer) {
        data = stream.Readable.from(data) as NodeJS.ReadableStream;
    }
    const ndata = data;
    return new Promise((resolve, reject) => {
        try {
            const jsonstream = JSONStream.parse('$*');
            const result: any = {};
            jsonstream.on('data', data => {
                const key = data.key;
                const value = data.value;
                _.set(result, key, value);
            });
            jsonstream.on('end', data => {
                resolve(result)
            });

            jsonstream.on('error', err => {
                reject(err);
            });

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
            st.pipe(jsonstream);
        }
        catch (err) {
            reject(err);
        }
    });
}


export function encodeToStream(data: NodeJS.ReadableStream | Buffer, ...parsersDefs: Array<{ parser: string, opts?: any }>) {
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
                st = st.pipe(parser.decode(p.opts));
            }
        }
    }

    return st;
}