"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddlewareConstructor = exports.addMiddleware = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const mids = {};
function addMiddleware(name, constructor, parameters) {
    try {
        logger_1.logger.info(`Loading ${name} Middleware`);
        schemas_1.addNewSchema(name, parameters);
        mids[name] = constructor;
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${name} -- `, err);
    }
}
exports.addMiddleware = addMiddleware;
function getMiddlewareConstructor(name) {
    return mids[name];
}
exports.getMiddlewareConstructor = getMiddlewareConstructor;
//# sourceMappingURL=middlewares.js.map