"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.addBufferToBuffer = exports.addBufferToAny = exports.addAnyToBuffer = void 0;
const logger_1 = require("../util/logger");
const lodash_1 = __importDefault(require("lodash"));
const anyToBuffer = new Map;
function addAnyToBuffer(type, parser) {
    try {
        logger_1.logger.info(`Loading ${type} Parser`);
        anyToBuffer.set(type, parser);
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${type} -- `, err);
    }
}
exports.addAnyToBuffer = addAnyToBuffer;
const bufferToAny = new Map;
function addBufferToAny(type, parser) {
    try {
        logger_1.logger.info(`Loading ${type} Parser`);
        bufferToAny.set(type, parser);
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${type} -- `, err);
    }
}
exports.addBufferToAny = addBufferToAny;
const bufferToBuffer = new Map;
function addBufferToBuffer(type, parser) {
    try {
        logger_1.logger.info(`Loading ${type} Parser`);
        bufferToBuffer.set(type, parser);
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${type} -- `, err);
    }
}
exports.addBufferToBuffer = addBufferToBuffer;
function transform(input, parsers) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        if (lodash_1.default.isUndefined(input)) {
            return undefined;
        }
        const atbOptions = parsers.atb;
        const btbOptions = parsers.btb;
        const btaOptions = parsers.bta;
        const atb = anyToBuffer.get((_a = atbOptions === null || atbOptions === void 0 ? void 0 : atbOptions.parser) !== null && _a !== void 0 ? _a : '');
        const bta = bufferToAny.get((_b = btaOptions === null || btaOptions === void 0 ? void 0 : btaOptions.parser) !== null && _b !== void 0 ? _b : '');
        if (!lodash_1.default.isUndefined(atbOptions) && lodash_1.default.isUndefined(atb)) {
            throw Error('AnyToBuffer not exists');
        }
        if (!lodash_1.default.isUndefined(btaOptions) && lodash_1.default.isUndefined(bta)) {
            throw Error('BufferToAny not exists');
        }
        let ipt = input;
        if (lodash_1.default.isString(input)) {
            ipt = Buffer.from(input);
        }
        if (!lodash_1.default.isBuffer(ipt) && lodash_1.default.isUndefined(atb)) {
            throw Error('AnyToBuffer MUST be defined');
        }
        if (!lodash_1.default.isUndefined(atb)) {
            ipt = yield atb.transformAnyToBuffer(ipt, atbOptions === null || atbOptions === void 0 ? void 0 : atbOptions.opts);
        }
        if (!lodash_1.default.isUndefined(btbOptions)) {
            for (const btbopt of btbOptions) {
                const btb = bufferToBuffer.get(btbopt.parser);
                if (lodash_1.default.isUndefined(btb)) {
                    throw Error(`BufferToBuffer ${btbopt.parser} not exists`);
                }
                ipt = yield btb.transformBufferToBuffer(ipt, btbopt.opts);
            }
        }
        if (!lodash_1.default.isUndefined(bta)) {
            ipt = yield bta.transformBufferToAny(ipt, btaOptions === null || btaOptions === void 0 ? void 0 : btaOptions.opts);
        }
        return ipt;
    });
}
exports.transform = transform;
exports.default = {
    transform
};
//# sourceMappingURL=parsers.js.map