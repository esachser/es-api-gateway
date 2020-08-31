"use strict";
// ======== MASTER FUNCTIONS ==================
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
exports.masterLoadResourcesWatcher = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const cluster_1 = __importDefault(require("cluster"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const etdc_1 = __importDefault(require("./etdc"));
const _1 = require(".");
const logger_1 = require("./logger");
let masterEtcdWatcher;
let masterFileWatcher;
let resourcesStatuses = {};
function masterLoadResourcesWatcher(envName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!cluster_1.default.isMaster)
            return;
        resourcesStatuses = {};
        const envDir = path_1.default.resolve(_1.baseDirectory, 'resources', envName);
        yield promises_1.default.mkdir(envDir, { recursive: true });
        const etcdDir = `esgateway/envs/${envName}/resources`;
        // Configura o watcher de API
        if (masterEtcdWatcher !== undefined) {
            yield masterEtcdWatcher.cancel();
        }
        masterEtcdWatcher = yield etdc_1.default().watch().prefix(etcdDir).create();
        masterEtcdWatcher.on('put', (kv) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const basename = kv.key.toString('utf8').replace(etcdDir, '');
                const status = (_a = resourcesStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                if (status !== 'local_changed') {
                    logger_1.logger.info(`Receiving update (ETCD --> Local) from resource ${basename}`);
                    const fname = path_1.default.resolve(envDir, ...basename.split('/'));
                    resourcesStatuses[basename] = 'etcd_changed';
                    const fdir = path_1.default.dirname(fname);
                    yield promises_1.default.mkdir(fdir, { recursive: true });
                    yield promises_1.default.writeFile(fname, kv.value);
                }
                else {
                    delete resourcesStatuses[basename];
                }
            }
            catch (err) {
                logger_1.logger.error('Error adding/updating API', err);
            }
        }));
        masterEtcdWatcher.on('delete', (kv) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const basename = kv.key.toString('utf8').replace(etcdDir, '');
                const status = (_b = resourcesStatuses[basename]) !== null && _b !== void 0 ? _b : '';
                if (status !== 'local_deleted') {
                    logger_1.logger.info(`Receiving delete (ETCD --> Local) from resource ${basename}`);
                    const fname = path_1.default.resolve(envDir, ...basename.split('/'));
                    if (fs_1.default.existsSync(fname)) {
                        resourcesStatuses[basename] = 'etcd_deleted';
                        yield promises_1.default.unlink(fname);
                    }
                }
                else {
                    delete resourcesStatuses[basename];
                }
            }
            catch (err) {
                logger_1.logger.error('Error deleting API', err);
            }
        }));
        // Terá que carregar todas as APIs antes.
        // TODO: Carregar as APIs do ETCD primeiro, e depois deixar o watcher atualizar
        const etcdResources = yield etdc_1.default().getAll().prefix(etcdDir);
        for (const key in etcdResources) {
            const basename = key.replace(etcdDir, '');
            const value = etcdResources[key];
            resourcesStatuses[basename] = 'etcd_changed';
            const fname = path_1.default.resolve(envDir, basename);
            yield promises_1.default.writeFile(fname, value);
        }
        // Carrega o file watcher
        function masterUpdateApi(fname) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const basename = fname.replace(envDir, '');
                const status = (_a = resourcesStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                if (status !== 'etcd_changed') {
                    logger_1.logger.info(`Sending update (local --> ETCD) from resource ${basename}`);
                    resourcesStatuses[basename] = 'local_changed';
                    const key = `${etcdDir}${basename.split(path_1.default.sep).join('/')}`;
                    const value = yield promises_1.default.readFile(fname);
                    yield etdc_1.default().put(key).value(value);
                }
                else {
                    delete resourcesStatuses[basename];
                }
            });
        }
        function masterDeleteApi(fname) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const basename = fname.replace(envDir, '');
                const status = (_a = resourcesStatuses[basename]) !== null && _a !== void 0 ? _a : '';
                if (status !== 'etcd_deleted') {
                    logger_1.logger.info(`Sending delete (local --> ETCD) from resource ${basename}`);
                    resourcesStatuses[basename] = 'local_deleted';
                    const key = `${etcdDir}${basename.split(path_1.default.sep).join('/')}`;
                    yield etdc_1.default().delete().key(key);
                }
                else {
                    delete resourcesStatuses[basename];
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
exports.masterLoadResourcesWatcher = masterLoadResourcesWatcher;
//# sourceMappingURL=sync-resources.js.map