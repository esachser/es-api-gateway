"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeToStream = exports.decodeToObject = exports.addParser = void 0;
const logger_1 = require("../util/logger");
const stream_1 = __importDefault(require("stream"));
const util_1 = __importDefault(require("util"));
const pipeline = util_1.default.promisify(stream_1.default.pipeline);
const parsers = {};
function addParser(type, parser) {
    try {
        logger_1.logger.info(`Loading ${type} Parser`);
        parsers[type] = parser;
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${type} -- `, err);
    }
}
exports.addParser = addParser;
function decodeToObject(data, ...parsersDefs) {
    if (data === undefined) {
        return Promise.resolve(data);
    }
    if (data instanceof Buffer) {
        if (data.length === 0) {
            return Promise.resolve(undefined);
        }
        data = stream_1.default.Readable.from(data);
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
            let result = {};
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
exports.decodeToObject = decodeToObject;
function encodeToStream(data, ...parsersDefs) {
    if (data === undefined) {
        return data;
    }
    if (data instanceof Buffer) {
        data = stream_1.default.Readable.from(data);
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
exports.encodeToStream = encodeToStream;
//# sourceMappingURL=parsers.js.map