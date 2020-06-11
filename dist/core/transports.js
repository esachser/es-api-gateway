"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportConstructor = exports.addTransport = void 0;
var logger_1 = require("../util/logger");
var schemas_1 = require("./schemas");
var transports = {};
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