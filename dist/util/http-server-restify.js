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
const restify_1 = __importDefault(require("restify"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const lodash_1 = __importDefault(require("lodash"));
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const routers = {};
function getHttpRouter(id) {
    return routers[id].router;
}
exports.getHttpRouter = getHttpRouter;
function clearRouters() {
    // for (const k in routers) {
    //     const r = routers[k].router;
    //     if (r !== undefined) {
    //         r.
    //         // r.reset();
    //     }
    // }
}
exports.clearRouters = clearRouters;
function loadHttpServer(conf) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const port = lodash_1.default.get(conf, 'port');
        const secure = lodash_1.default.get(conf, 'secure', false);
        const id = lodash_1.default.get(conf, 'id');
        let app = (_a = routers[id]) === null || _a === void 0 ? void 0 : _a.router;
        if (app) {
            yield util_1.default.promisify(app.close());
        }
        if (secure) {
            const keyFile = lodash_1.default.get(conf, 'keyFile');
            const passphrase = lodash_1.default.get(conf, 'passphrase');
            const certFile = lodash_1.default.get(conf, 'certFile');
            app = restify_1.default.createServer({
                httpsServerOptions: {
                    key: fs_1.default.readFileSync(keyFile, 'binary'),
                    passphrase,
                    cert: fs_1.default.readFileSync(certFile, 'binary'),
                }
            });
        }
        else {
            app = restify_1.default.createServer();
        }
        app.use(helmet_1.default());
        lodash_1.default.set(routers, `[${id}].router`, app);
        app.router.defaultRoute = (req, res, next) => {
            res.set('host', 'es-api-gateway 0.1.0');
            res.send(404, {
                error: 'Not Found'
            });
            return next();
        };
        const ap = app;
        yield new Promise((res, rej) => ap.listen(port, '0.0.0.0', (err) => {
            if (!!err) {
                return rej(err);
            }
            logger_1.logger.info(`HTTP server ${id} listening on port ${port}`);
            return res();
        }));
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
//# sourceMappingURL=http-server-restify.js.map