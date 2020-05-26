"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadHttpServer = exports.httpRouter = void 0;
var koa_1 = __importDefault(require("koa"));
var koa_router_1 = __importDefault(require("koa-router"));
var koa_helmet_1 = __importDefault(require("koa-helmet"));
var koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
var config_1 = require("./config");
var logger_1 = require("./logger");
exports.httpRouter = new koa_router_1.default();
function loadHttpServer() {
    var app = new koa_1.default();
    app.use(koa_helmet_1.default());
    app.use(koa_bodyparser_1.default());
    app.use(exports.httpRouter.middleware());
    var server = app.listen(config_1.configuration.httpPort || 3000, function () {
        var port = server.address().port;
        logger_1.logger.info("Http Server running on port " + port);
    });
}
exports.loadHttpServer = loadHttpServer;
//# sourceMappingURL=http-server.js.map