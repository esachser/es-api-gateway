"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddlewareConstructor = exports.addMiddleware = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const mids = {};
function addMiddleware(name, constructor, parameters) {
    logger_1.logger.info('Loading Property Middleware');
    mids[name] = constructor;
    schemas_1.addNewSchema(name, parameters);
}
exports.addMiddleware = addMiddleware;
function getMiddlewareConstructor(name) {
    return mids[name];
}
exports.getMiddlewareConstructor = getMiddlewareConstructor;
//# sourceMappingURL=middlewares.js.map