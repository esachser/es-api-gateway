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
exports.loadHttpServers = exports.loadHttpServer = exports.clearRouters = exports.getHttpRouter = void 0;
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
//import router from 'koa-router-find-my-way';
const koa_helmet_1 = __importDefault(require("koa-helmet"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const lodash_1 = __importDefault(require("lodash"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const routers = {};
function getHttpRouter(id) {
    return routers[id].router;
}
exports.getHttpRouter = getHttpRouter;
function clearRouters() {
    for (const k in routers) {
        const r = routers[k].router;
        if (r !== undefined) {
            r.stack = [];
            // r.reset();
        }
    }
}
exports.clearRouters = clearRouters;
function loadHttpServer(conf) {
    var _a, _b;
    const port = lodash_1.default.get(conf, 'port');
    const secure = lodash_1.default.get(conf, 'secure', false);
    const id = lodash_1.default.get(conf, 'id');
    const app = new koa_1.default();
    app.use(koa_helmet_1.default());
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        yield next();
        if (ctx.status === 404 && ctx.body === undefined) {
            ctx.body = {
                error: 'Not Found'
            };
            ctx.status = 404;
        }
        else if (ctx.status === 405 && ctx.body === undefined) {
            ctx.body = {
                error: 'Method not allowed'
            };
            ctx.status = 405;
        }
    }));
    const httpRouter = (_b = (_a = routers[id]) === null || _a === void 0 ? void 0 : _a.router) !== null && _b !== void 0 ? _b : new router_1.default();
    // const httpRouter = routers[id]?.router ?? router();
    lodash_1.default.set(routers, `[${id}].router`, httpRouter);
    app.use(httpRouter.routes()).use(httpRouter.allowedMethods());
    // app.use(httpRouter.routes());
    app.on('error', (err, ctx) => {
        logger_1.logger.error('Erro no servidor HTTP', err);
    });
    return new Promise((resolve, reject) => {
        var _a;
        let server = (_a = routers[id]) === null || _a === void 0 ? void 0 : _a.server;
        function createServer() {
            if (secure) {
                const keyFile = lodash_1.default.get(conf, 'keyFile');
                const passphrase = lodash_1.default.get(conf, 'passphrase');
                const certFile = lodash_1.default.get(conf, 'certFile');
                server = https_1.default.createServer({
                    key: fs_1.default.readFileSync(keyFile, 'binary'),
                    passphrase,
                    cert: fs_1.default.readFileSync(certFile, 'binary'),
                    requestCert: true,
                    rejectUnauthorized: false
                }, app.callback()).listen(port, () => {
                    const { port } = server === null || server === void 0 ? void 0 : server.address();
                    logger_1.logger.info(`Https Server running on port ${port}`);
                    return resolve();
                });
            }
            else {
                server = http_1.default.createServer(app.callback()).listen(port, () => {
                    const { port } = server === null || server === void 0 ? void 0 : server.address();
                    logger_1.logger.info(`Http Server running on port ${port}`);
                    return resolve();
                });
            }
            server.once('error', err => {
                reject(err);
            });
            lodash_1.default.set(routers, `[${id}].server`, server);
        }
        if (server !== undefined) {
            server.close(err => {
                if (err)
                    return reject(err);
                createServer();
            });
        }
        else {
            createServer();
        }
    });
}
exports.loadHttpServer = loadHttpServer;
function loadHttpServers() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const httpConfs = (_a = config_1.configuration.transports) === null || _a === void 0 ? void 0 : _a.filter(c => c.type === 'http');
        if (httpConfs === undefined)
            return;
        for (const cnf of httpConfs) {
            try {
                yield loadHttpServer(cnf);
            }
            catch (err) {
                logger_1.logger.error('Error loading Http Server', err);
            }
        }
    });
}
exports.loadHttpServers = loadHttpServers;
//# sourceMappingURL=http-server-koa.js.map