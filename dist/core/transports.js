"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportConstructor = exports.addTransport = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const transports = {};
function addTransport(name, constructor, parameters) {
    logger_1.logger.info('Loading Http Tranport');
    transports[name] = constructor;
    schemas_1.addNewSchema(name, parameters);
}
exports.addTransport = addTransport;
function getTransportConstructor(name) {
    return transports[name];
}
exports.getTransportConstructor = getTransportConstructor;
//# sourceMappingURL=transports.js.map