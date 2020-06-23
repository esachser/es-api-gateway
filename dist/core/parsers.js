"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeToStream = exports.decodeToObject = exports.addParser = void 0;
const logger_1 = require("../util/logger");
const stream_1 = __importDefault(require("stream"));
const util_1 = __importDefault(require("util"));
const JSONStream_1 = __importDefault(require("JSONStream"));
const lodash_1 = __importDefault(require("lodash"));
const pipeline = util_1.default.promisify(stream_1.default.pipeline);
const parsers = {
    'JSONParser': {
        decode: JSONStream_1.default.parse,
        encode: JSONStream_1.default.stringify
    }
};
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
    return new Promise((resolve, reject) => {
        try {
            const jsonstream = JSONStream_1.default.parse('$*');
            const result = {};
            jsonstream.on('data', data => {
                const key = data.key;
                const value = data.value;
                lodash_1.default.set(result, key, value);
            });
            jsonstream.on('end', data => {
                resolve(result);
            });
            jsonstream.on('error', err => {
                reject(err);
            });
            let stream = data;
            if (parsersDefs.length > 0) {
                for (const p of parsersDefs) {
                    const parser = parsers[p.parser];
                    if (parser === undefined) {
                        throw Error('No parser found');
                    }
                    else {
                        stream = stream.pipe(parser.decode(p.opts));
                    }
                }
            }
            stream.pipe(jsonstream);
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.decodeToObject = decodeToObject;
function encodeToStream(data, ...parsersDefs) {
    let stream = data;
    if (parsersDefs.length > 0) {
        for (const p of parsersDefs) {
            const parser = parsers[p.parser];
            if (parser === undefined) {
                throw Error('No parser found');
            }
            else {
                stream = stream.pipe(parser.decode(p.opts));
            }
        }
    }
    return stream;
}
exports.encodeToStream = encodeToStream;
//# sourceMappingURL=parsers.js.map