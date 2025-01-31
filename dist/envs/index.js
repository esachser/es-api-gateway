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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterLoadApiWatcher = exports.loadEnv = exports.reloadApi = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const cluster_1 = __importDefault(require("cluster"));
const lodash_1 = __importDefault(require("lodash"));
const util_1 = require("../util");
const logger_1 = require("../util/logger");
const schemas_1 = require("../core/schemas");
const config_1 = require("../util/config");
const http_server_1 = require("../util/http-server");
const transports_1 = require("../core/transports");
const middlewares_1 = require("../core/middlewares");
const etdc_1 = __importDefault(require("../util/etdc"));
const util_2 = __importDefault(require("util"));
const fsasync = {
    stat: util_2.default.promisify(fs_1.default.stat),
    mkdir: util_2.default.promisify(fs_1.default.mkdir),
    writeFile: util_2.default.promisify(fs_1.default.writeFile),
    readFile: util_2.default.promisify(fs_1.default.readFile),
    unlink: util_2.default.promisify(fs_1.default.unlink)
};
let apis = {};
function loadApiFile(fname) {
    var e_1, _a;
    var _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const apiJson = yield util_1.readFileToObject(fname);
        logger_1.logger.debug(apiJson);
        const ext = path_1.default.extname(fname);
        fname = path_1.default.basename(fname, ext);
        let api = (_b = apis[fname]) !== null && _b !== void 0 ? _b : {
            transports: [],
            logger: {},
            apiFile: `${fname}${ext}`
        };
        delete apis[fname];
        for (const tname of Object.keys(api.transports)) {
            if (api.transports[tname] !== undefined) {
                api.transports[tname].clear();
                (_c = api.logger) === null || _c === void 0 ? void 0 : _c.close();
                delete api.logger;
                delete api.transports[tname];
            }
        }
        if (!(yield schemas_1.validateObject('es-api', apiJson))) {
            return;
        }
        // Carrega Middlewares iniciais.
        const initJs = lodash_1.default.get(apiJson, 'init', []);
        // Carrega Middlewares centrais.
        const executionJs = lodash_1.default.get(apiJson, 'execution');
        let logLevel = lodash_1.default.get(apiJson, 'logging.level', 'info');
        if (!lodash_1.default.isString(logLevel)) {
            logLevel = 'info';
        }
        api.logger = logger_1.createLogger(logLevel, fname);
        const transports = lodash_1.default.get(apiJson, 'transports');
        const apiEnabled = lodash_1.default.get(apiJson, 'enabled', true);
        const initialMid = yield middlewares_1.createMiddleware(initJs, 0, fname);
        const centralMid = yield middlewares_1.createMiddleware(executionJs, 0, fname);
        if (transports !== undefined && lodash_1.default.isArray(transports)) {
            for (const transport of transports) {
                const trpEnabled = lodash_1.default.get(transport, 'enabled', true);
                if (apiEnabled && trpEnabled) {
                    const ids = lodash_1.default.get(transport, 'id', '').split(',');
                    const type = lodash_1.default.get(transport, 'type');
                    const parameters = lodash_1.default.get(transport, 'parameters');
                    const mids = lodash_1.default.get(transport, 'mids');
                    try {
                        for (var ids_1 = (e_1 = void 0, __asyncValues(ids)), ids_1_1; ids_1_1 = yield ids_1.next(), !ids_1_1.done;) {
                            let id = ids_1_1.value;
                            id = id.trim();
                            const imid = middlewares_1.copyMiddleware(initialMid);
                            const cmid = middlewares_1.copyMiddleware(centralMid);
                            const pre = yield middlewares_1.createMiddleware(mids, 0, fname);
                            const mid = middlewares_1.connectMiddlewares(pre, cmid);
                            const trp = yield transports_1.createTransport(type, fname, id, api.logger, parameters, mid, imid);
                            if (trp !== undefined) {
                                api.transports[id] = trp;
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (ids_1_1 && !ids_1_1.done && (_a = ids_1.return)) yield _a.call(ids_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            }
        }
        apis[fname] = api;
    });
}
// async function reloadEnv(dir: string) {
//     const finfos = await fsasync.readdir(dir, { withFileTypes: true });
//     finfos.filter(f => f.isFile() && (f.name.endsWith('.json') || f.name.endsWith('.yaml') )).forEach(finfo => {
//         logger.info(`Loading API ${finfo.name}`);
//         loadApiFile(path.resolve(dir, finfo.name)).catch(e => {
//             logger.error(`Error loading file ${finfo.name}`, e);
//         });
//     });
// }
let watcher;
function reloadApi(apiName) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiJson = path_1.default.resolve(util_1.baseDirectory, 'envs', config_1.configuration.env, `${apiName}.json`);
        const apiYaml = path_1.default.resolve(util_1.baseDirectory, 'envs', config_1.configuration.env, `${apiName}.yaml`);
        if (fs_1.default.existsSync(apiJson)) {
            return loadApiFile(apiJson);
        }
        else if (fs_1.default.existsSync(apiYaml)) {
            return loadApiFile(apiYaml);
        }
    });
}
exports.reloadApi = reloadApi;
function loadEnv(envName) {
    return __awaiter(this, void 0, void 0, function* () {
        const envDir = path_1.default.resolve(util_1.baseDirectory, 'envs', envName);
        const envDirExists = fs_1.default.existsSync(envDir);
        if (watcher !== undefined) {
            watcher.close();
            http_server_1.clearRouters();
        }
        if (envDirExists) {
            const envFinfo = yield fsasync.stat(envDir);
            if (envFinfo.isDirectory()) {
                //reloadEnv(envDir);
                watcher = chokidar_1.default.watch(envDir).on('all', (ev, fname) => {
                    if (ev === 'addDir')
                        return;
                    if (fname.endsWith('.json') || fname.endsWith('.yaml')) {
                        logger_1.logger.info(`Reloading ${path_1.default.basename(fname)}.`);
                        loadApiFile(fname).catch(err => {
                            logger_1.logger.error(`Error reloading file ${fname}.`, err);
                        });
                    }
                });
            }
        }
    });
}
exports.loadEnv = loadEnv;
;
// ======== MASTER FUNCTIONS ==================
let masterEtcdWatcher;
let masterFileWatcher;
let apiStatuses = {};
function masterLoadApiWatcher(envName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cluster_1.default.isMaster)
            return;
        apiStatuses = {};
        const envDir = path_1.default.resolve(util_1.baseDirectory, 'envs', envName);
        yield fsasync.mkdir(envDir, { recursive: true });
        // Configura o watcher de API
        if (masterEtcdWatcher !== undefined) {
            yield masterEtcdWatcher.cancel();
        }
        masterEtcdWatcher = yield etdc_1.default().watch().prefix(`esgateway/envs/${envName}/apis/`).create();
        masterEtcdWatcher.on('put', (kv) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const basename = path_1.default.basename(kv.key.toString('utf8'));
                const status = (_a = apiStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                if (status !== 'local_changed') {
                    logger_1.logger.info(`Receiving update (ETCD --> Local) from api ${basename}`);
                    const fname = path_1.default.resolve(envDir, basename);
                    apiStatuses[basename] = 'etcd_changed';
                    yield fsasync.writeFile(fname, kv.value);
                }
                else {
                    delete apiStatuses[basename];
                }
            }
            catch (err) {
                logger_1.logger.error('Error adding/updating API', err);
            }
        }));
        masterEtcdWatcher.on('delete', (kv) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const basename = path_1.default.basename(kv.key.toString('utf8'));
                const status = (_b = apiStatuses[basename]) !== null && _b !== void 0 ? _b : '';
                if (status !== 'local_deleted') {
                    logger_1.logger.info(`Receiving delete (ETCD --> Local) from api ${basename}`);
                    const fname = path_1.default.resolve(envDir, basename);
                    if (fs_1.default.existsSync(fname)) {
                        apiStatuses[basename] = 'etcd_deleted';
                        yield fsasync.unlink(fname);
                    }
                }
                else {
                    delete apiStatuses[basename];
                }
            }
            catch (err) {
                logger_1.logger.error('Error deleting API', err);
            }
        }));
        // Terá que carregar todas as APIs antes.
        // TODO: Carregar as APIs do ETCD primeiro, e depois deixar o watcher atualizar
        const etcdApis = yield etdc_1.default().getAll().prefix(`esgateway/envs/${envName}/apis/`);
        for (const key in etcdApis) {
            const basename = path_1.default.basename(key);
            const value = etcdApis[key];
            apiStatuses[basename] = 'etcd_changed';
            const fname = path_1.default.resolve(envDir, basename);
            yield fsasync.writeFile(fname, value);
        }
        // Carrega o file watcher
        function masterUpdateApi(fname) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const basename = path_1.default.basename(fname);
                    const status = (_a = apiStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                    if (status !== 'etcd_changed') {
                        logger_1.logger.info(`Sending update (local --> ETCD) from api ${basename}`);
                        apiStatuses[basename] = 'local_changed';
                        const key = `esgateway/envs/${envName}/apis/${basename}`;
                        const value = yield fsasync.readFile(fname);
                        yield etdc_1.default().put(key).value(value);
                    }
                    else {
                        delete apiStatuses[basename];
                    }
                }
                catch (err) {
                    logger_1.logger.error('Error adding/updating API', err);
                }
            });
        }
        function masterDeleteApi(fname) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const basename = path_1.default.basename(fname);
                    const status = (_a = apiStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                    if (status !== 'etcd_deleted') {
                        logger_1.logger.info(`Sending delete (local --> ETCD) from api ${basename}`);
                        apiStatuses[basename] = 'local_deleted';
                        const key = `esgateway/envs/${envName}/apis/${basename}`;
                        yield etdc_1.default().delete().key(key);
                    }
                    else {
                        delete apiStatuses[basename];
                    }
                }
                catch (err) {
                    logger_1.logger.error('Error deleting API', err);
                }
            });
        }
        if (masterFileWatcher !== undefined) {
            yield masterFileWatcher.close();
        }
        masterFileWatcher = chokidar_1.default.watch(envDir)
            .on('add', masterUpdateApi)
            .on('change', masterUpdateApi)
            .on('unlink', masterDeleteApi);
    });
}
exports.masterLoadApiWatcher = masterLoadApiWatcher;
//# sourceMappingURL=index.js.map