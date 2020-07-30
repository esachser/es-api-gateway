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
exports.loadEnv = exports.reloadApi = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const util_1 = require("../util");
const logger_1 = require("../util/logger");
const core_1 = require("../core");
const schemas_1 = require("../core/schemas");
const config_1 = require("../util/config");
const http_server_1 = require("../util/http-server");
let apis = {};
function loadApiFile(fname) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const apiJson = yield util_1.readFileToObject(fname);
        logger_1.logger.debug(apiJson);
        const ext = path_1.default.extname(fname);
        fname = path_1.default.basename(fname, ext);
        let api = (_a = apis[fname]) !== null && _a !== void 0 ? _a : {
            transports: [],
            central: {},
            logger: {},
            apiFile: `${fname}${ext}`
        };
        delete apis[fname];
        for (const tname of Object.keys(api.transports)) {
            if (api.transports[tname] !== undefined) {
                api.transports[tname].clear();
                (_b = api.logger) === null || _b === void 0 ? void 0 : _b.close();
                delete api.transports[tname];
            }
        }
        if (!(yield schemas_1.validateObject('es-api', apiJson))) {
            return;
        }
        // Carrega Middlewares iniciais.
        const initJs = lodash_1.default.get(apiJson, 'init', []);
        const initialMid = yield core_1.createMiddleware(initJs, 0, fname);
        // Carrega Middlewares centrais.
        const executionJs = lodash_1.default.get(apiJson, 'execution');
        const centralMid = yield core_1.createMiddleware(executionJs, 0, fname);
        let logLevel = lodash_1.default.get(apiJson, 'logging.level', 'info');
        if (!lodash_1.default.isString(logLevel)) {
            logLevel = 'info';
        }
        api.central = centralMid;
        api.logger = logger_1.createLogger(logLevel, fname);
        const transports = lodash_1.default.get(apiJson, 'transports');
        if (transports !== undefined && lodash_1.default.isArray(transports)) {
            for (const transport of transports) {
                const type = lodash_1.default.get(transport, 'type');
                const id = lodash_1.default.get(transport, 'id');
                const parameters = lodash_1.default.get(transport, 'parameters');
                const mids = lodash_1.default.get(transport, 'mids');
                const pre = yield core_1.createMiddleware(mids, 0, fname);
                const mid = core_1.connectMiddlewares(pre, centralMid);
                if (api.transports[id] !== undefined) {
                    api.transports[id].clear();
                    delete api.transports[id];
                }
                const trp = yield core_1.createTransport(type, fname, id, api.logger, parameters, mid, initialMid);
                if (trp !== undefined) {
                    api.transports[id] = trp;
                }
            }
        }
        apis[fname] = api;
    });
}
function reloadEnv(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const finfos = yield promises_1.default.readdir(dir, { withFileTypes: true });
        finfos.filter(f => f.isFile() && (f.name.endsWith('.json') || f.name.endsWith('.yaml'))).forEach(finfo => {
            logger_1.logger.info(`Loading API ${finfo.name}`);
            loadApiFile(path_1.default.resolve(dir, finfo.name)).catch(e => {
                logger_1.logger.error(`Error loading file ${finfo.name}`, e);
            });
        });
    });
}
let watcher = undefined;
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
            const envFinfo = yield promises_1.default.stat(envDir);
            if (envFinfo.isDirectory()) {
                reloadEnv(envDir);
                watcher = fs_1.default.watch(envDir, (ev, fname) => {
                    if (fname.endsWith('.json') || fname.endsWith('.yaml')) {
                        // reloadEnv(envDir);
                        logger_1.logger.info(`Reloading ${fname}.`);
                        loadApiFile(path_1.default.resolve(envDir, fname)).catch(err => {
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
//# sourceMappingURL=index.js.map