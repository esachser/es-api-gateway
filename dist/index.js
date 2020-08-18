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
const config_1 = require("./util/config");
const middlewares_1 = require("./middlewares");
const logger_1 = require("./util/logger");
const transports_1 = require("./transports");
const envs_1 = require("./envs");
const http_server_1 = require("./util/http-server");
const schemas_1 = require("./core/schemas");
const authenticators_1 = require("./authenticators");
const parsers_1 = require("./parsers");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield config_1.loadConfig();
        parsers_1.loadParsers();
        middlewares_1.loadMiddlewares();
        yield middlewares_1.loadCustomMiddlewares();
        transports_1.loadTransports();
        transports_1.loadCustomTransports();
        authenticators_1.loadAuthenticators();
        yield http_server_1.loadHttpServers();
        schemas_1.loadJsonSchemaValidator();
        yield authenticators_1.startAuthenticators();
        yield envs_1.loadEnv(config_1.configuration.env);
    });
}
// Cluster start
const cluster_1 = __importDefault(require("cluster"));
const os_1 = __importDefault(require("os"));
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const schedule_1 = require("./transports/schedule");
const redissub_1 = require("./transports/redissub");
const numCpus = os_1.default.cpus().length;
if (cluster_1.default.isMaster) {
    new rate_limiter_flexible_1.RateLimiterClusterMaster();
    for (let i = 0; i < numCpus; i++) {
        cluster_1.default.fork();
    }
    cluster_1.default.on('exit', (worker, code, signal) => {
        logger_1.logger.info(`worker ${worker.process.pid} died`);
        setIdToSchedule();
    });
    function setIdToSchedule() {
        var _a, _b, _c;
        let fid = undefined;
        for (const id in cluster_1.default.workers) {
            if ((_a = cluster_1.default.workers[id]) === null || _a === void 0 ? void 0 : _a.isConnected()) {
                fid = fid !== null && fid !== void 0 ? fid : (_b = cluster_1.default.workers[id]) === null || _b === void 0 ? void 0 : _b.id;
                (_c = cluster_1.default.workers[id]) === null || _c === void 0 ? void 0 : _c.send({ type: 'SET_ID_SCHEDULER', data: fid });
            }
        }
    }
    setIdToSchedule();
}
else {
    start().catch(e => {
        logger_1.logger.error('General error', e);
    });
    logger_1.logger.info(`Worker ${cluster_1.default.worker.id} on pid ${cluster_1.default.worker.process.pid} running.`);
    process.on('message', (msg) => {
        switch (msg.type) {
            case 'SET_ID_SCHEDULER':
                schedule_1.setIdScheduler(msg.data);
                redissub_1.setIdSub(msg.data);
                break;
        }
    });
}
//# sourceMappingURL=index.js.map