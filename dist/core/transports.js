"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportConstructor = exports.addTransport = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
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
//# sourceMappingURL=transports.js.map