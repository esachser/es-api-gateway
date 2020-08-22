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
exports.loadConfig = exports.configuration = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const logger_1 = require("./logger");
const envs_1 = require("../envs");
const authenticators_1 = require("../authenticators");
const http_server_1 = require("./http-server");
const cluster_1 = __importDefault(require("cluster"));
;
exports.configuration = { env: 'local' };
const configFileName = path_1.default.resolve(_1.baseDirectory, 'conf', 'global.json');
function loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Reloading global config file');
        const text = yield promises_1.default.readFile(configFileName);
        exports.configuration = JSON.parse(text.toString());
        logger_1.logger.level = exports.configuration.logLevel || 'info';
    });
}
exports.loadConfig = loadConfig;
if (cluster_1.default.isWorker) {
    fs_1.default.watch(configFileName, (event, fname) => __awaiter(void 0, void 0, void 0, function* () {
        yield loadConfig().catch(e => {
            logger_1.logger.error('Error loading config', e);
        });
        yield authenticators_1.startAuthenticators().catch(e => {
            logger_1.logger.error('Error starting authenticators', e);
        });
        yield http_server_1.loadHttpServers().catch(e => {
            logger_1.logger.error('Error loading HTTP Transports', e);
        });
        yield envs_1.loadEnv(exports.configuration.env).catch(e => {
            logger_1.logger.error('Error loading APIs', e);
        });
    }));
}
//# sourceMappingURL=config.js.map