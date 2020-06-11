"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddlewareConstructor = exports.addMiddleware = void 0;
var logger_1 = require("../util/logger");
var schemas_1 = require("./schemas");
var mids = {};
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