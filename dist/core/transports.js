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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = exports.getTransportConstructor = exports.addTransport = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const errors_1 = require("./errors");
const transports = {};
function addTransport(name, constructor, parameters) {
    try {
        logger_1.logger.info(`Loading ${name} Tranport`);
        transports[name] = constructor;
        schemas_1.addNewSchema(name, parameters);
    }
    catch (err) {
        logger_1.logger.error(`Error loading transport ${name} -- `, err);
    }
}
exports.addTransport = addTransport;
function getTransportConstructor(name) {
    return transports[name];
}
exports.getTransportConstructor = getTransportConstructor;
function createTransport(type, api, tid, logger, parameters, middleware, initialMid) {
    return __awaiter(this, void 0, void 0, function* () {
        const ctor = getTransportConstructor(type);
        if (ctor === undefined) {
            throw new errors_1.EsTransportError(type, `Constructor of ${type} doesnt exists`);
        }
        const v = yield schemas_1.validateObject(type, parameters);
        if (!v) {
            throw new errors_1.EsTransportError(type, `${type} parameters are invalid`);
        }
        const transport = new ctor(parameters, api, tid, logger, middleware, initialMid);
        yield transport.loadAsync(parameters);
        return transport;
    });
}
exports.createTransport = createTransport;
//# sourceMappingURL=transports.js.map