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
exports.loadMasterWatcher = exports.loadConfig = exports.configuration = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const logger_1 = require("./logger");
const envs_1 = require("../envs");
const authenticators_1 = require("../authenticators");
const http_server_1 = require("./http-server");
const cluster_1 = __importDefault(require("cluster"));
const etdc_1 = __importDefault(require("./etdc"));
;
exports.configuration = { env: 'local' };
const configFileName = path_1.default.resolve(_1.baseDirectory, 'conf', 'global.json');
const DEFAULT_CONFIG = {
    env: 'default',
    transports: [
        {
            type: 'http',
            port: 4000,
            id: 'http'
        }
    ]
};
function waiter(time) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), time);
    });
}
function masterProcessNewConfig() {
    if (!cluster_1.default.isMaster)
        return;
    watcher.removeAllListeners();
    setImmediate(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield waiter(1000);
            if (fs_1.default.existsSync(configFileName) && actual_version !== 'cancel') {
                if (actual_version === 'no_version') {
                    logger_1.logger.info('Updating ETCD Global config');
                    actual_version = 'this';
                    const client = etdc_1.default();
                    yield loadConfig();
                    const r = yield client
                        .if(ETCD_GLOBAL_CONFIG_KEY, 'Version', '!==', actual_version)
                        .then(client.put(ETCD_GLOBAL_CONFIG_KEY).value(JSON.stringify(exports.configuration, undefined, 2)))
                        .commit();
                }
                else {
                    actual_version = 'no_version';
                }
            }
            else {
                actual_version = 'no_version';
            }
        }
        catch (err) {
            logger_1.logger.error('Error writing new configuration', err);
        }
        watcher.once('change', masterProcessNewConfig);
    }));
}
let watcher;
function loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.logger.info('Reloading global config file');
        if (!fs_1.default.existsSync(configFileName)) {
            yield promises_1.default.mkdir(path_1.default.dirname(configFileName), { recursive: true });
            yield promises_1.default.writeFile(configFileName, JSON.stringify(DEFAULT_CONFIG));
        }
        const text = yield promises_1.default.readFile(configFileName);
        try {
            exports.configuration = JSON.parse(text.toString());
        }
        catch (_a) {
            exports.configuration = DEFAULT_CONFIG;
        }
        logger_1.logger.level = exports.configuration.logLevel || 'info';
        if (cluster_1.default.isWorker && watcher === undefined) {
            watcher = fs_1.default.watch(configFileName, (event, fname) => __awaiter(this, void 0, void 0, function* () {
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
        else if (cluster_1.default.isMaster && watcher === undefined) {
            watcher = fs_1.default.watch(configFileName, masterProcessNewConfig);
        }
    });
}
exports.loadConfig = loadConfig;
let masterWatcher;
let actual_version = 'no_version';
const ETCD_GLOBAL_CONFIG_KEY = 'esgateway/global.json';
function loadMasterWatcher() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cluster_1.default.isMaster) {
            const client = etdc_1.default();
            if (exports.configuration === undefined)
                yield loadConfig();
            yield client
                .if(ETCD_GLOBAL_CONFIG_KEY, 'Create', '==', 0)
                .then(client.put(ETCD_GLOBAL_CONFIG_KEY).value(JSON.stringify(exports.configuration, undefined, 2)))
                .commit();
            const cfg = yield client.get(ETCD_GLOBAL_CONFIG_KEY).json();
            if (cfg !== null) {
                actual_version = 'cancel';
                yield promises_1.default.writeFile(configFileName, JSON.stringify(cfg, undefined, 2));
            }
            if (masterWatcher !== undefined) {
                yield masterWatcher.cancel();
            }
            masterWatcher = yield client.watch().key(ETCD_GLOBAL_CONFIG_KEY).create();
            masterWatcher.on('put', (res) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (actual_version !== 'this') {
                        actual_version = res.version;
                        yield promises_1.default.writeFile(configFileName, res.value);
                    }
                    else {
                        actual_version = 'no_version';
                    }
                }
                catch (err) {
                    logger_1.logger.error('Error reloading configuration from Etcd', err);
                }
            }));
        }
    });
}
exports.loadMasterWatcher = loadMasterWatcher;
//# sourceMappingURL=config.js.map