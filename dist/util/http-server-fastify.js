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
exports.loadHttpServers = exports.loadHttpServer = exports.runServers = exports.clearRouters = exports.getHttpRouter = void 0;
const fastify_1 = __importDefault(require("fastify"));
const fastify_helmet_1 = __importDefault(require("fastify-helmet"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("fs"));
const routers = {};
function getHttpRouter(id) {
    return routers[id].router;
}
exports.getHttpRouter = getHttpRouter;
function clearRouters() {
    // for (const k in routers) {
    //     const r = routers[k].router;
    //     if (r !== undefined) {
    //         r.stack = [];
    //     }
    // }
}
exports.clearRouters = clearRouters;
function runServers() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const k in routers) {
            const r = routers[k].router;
            if (r !== undefined) {
                yield r.listen(routers[k].port, '0.0.0.0');
                console.log(r.printRoutes());
            }
        }
    });
}
exports.runServers = runServers;
function loadHttpServer(conf) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const port = lodash_1.default.get(conf, 'port');
        const secure = lodash_1.default.get(conf, 'secure', false);
        const id = lodash_1.default.get(conf, 'id');
        let app;
        let server = (_a = routers[id]) === null || _a === void 0 ? void 0 : _a.router;
        if (server !== undefined) {
            yield server.close();
        }
        if (secure) {
            const keyFile = lodash_1.default.get(conf, 'keyFile');
            const passphrase = lodash_1.default.get(conf, 'passphrase');
            const certFile = lodash_1.default.get(conf, 'certFile');
            app = fastify_1.default({
                https: {
                    key: fs_1.default.readFileSync(keyFile, 'binary'),
                    passphrase,
                    cert: fs_1.default.readFileSync(certFile, 'binary')
                }
            });
        }
        else {
            app = fastify_1.default();
        }
        app.addHook('onResponse', (request, response) => {
            const diff = response.getResponseTime();
            logger_1.logger.debug(`Total app process time: ${diff}ms`);
        });
        app.register(fastify_helmet_1.default);
        app.setNotFoundHandler((request, reply) => {
            reply.send({
                error: 'Not Found'
            });
            reply.status(404);
        });
        app.addContentTypeParser('*', function (request, payload, done) {
            done(null);
        });
        lodash_1.default.set(routers, `[${id}].router`, app);
        app.setErrorHandler((error, request, reply) => {
            logger_1.logger.error(`Error in Http Server id=${id} url=${request.routerPath}`, error);
            reply.send({
                error: 'Error processing request',
                message: 'Contact administrator for more details'
            });
            reply.status(500);
        });
        //await app.listen(port, '0.0.0.0');
        lodash_1.default.set(routers, `[${id}].port`, port);
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
//# sourceMappingURL=http-server-fastify.js.map