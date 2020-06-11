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
exports.loadEnv = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const util_1 = require("../util");
const logger_1 = require("../util/logger");
const core_1 = require("../core");
const http_server_1 = require("../util/http-server");
const schemas_1 = require("../core/schemas");
let apis = {};
function loadApiFile(fname) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiJson = JSON.parse((yield promises_1.default.readFile(fname).catch(e => { throw e; })).toString());
        logger_1.logger.debug(apiJson);
        if (!(yield schemas_1.validateObject('es-api', apiJson).catch(e => { throw e; }))) {
            return;
        }
        // Carrega Middlewares centrais.
        const executionJs = lodash_1.default.get(apiJson, 'execution');
        const centralMid = yield core_1.createMiddleware(executionJs, 0).catch(e => { throw e; });
        let api = apis[fname] || {
            transports: [],
            central: centralMid
        };
        const transports = lodash_1.default.get(apiJson, 'transports');
        if (transports !== undefined) {
            transports.forEach((transport) => __awaiter(this, void 0, void 0, function* () {
                const type = lodash_1.default.get(transport, 'type');
                const id = lodash_1.default.get(transport, 'id');
                const parameters = lodash_1.default.get(transport, 'parameters');
                const mids = lodash_1.default.get(transport, 'mids');
                const pre = yield core_1.createMiddleware(mids, 0).catch(e => { throw e; });
                const mid = core_1.connectMiddlewares(pre, centralMid);
                if (api.transports[id] !== undefined) {
                    api.transports[id].clear();
                    delete api.transports[id];
                }
                const trp = yield core_1.createTransport(type, parameters, mid).catch(e => { throw e; });
                if (trp !== undefined) {
                    api.transports[id] = trp;
                }
            }));
        }
        apis[fname] = api;
    });
}
function reloadEnv(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const finfos = yield promises_1.default.readdir(dir, { withFileTypes: true }).catch(e => { throw e; });
        finfos.filter(f => f.isFile() && f.name.endsWith('.json')).forEach(finfo => {
            logger_1.logger.info(`Loading API ${finfo.name}`);
            loadApiFile(path_1.default.resolve(dir, finfo.name)).catch(e => {
                logger_1.logger.error(`Error loding file ${finfo.name}`, e);
            });
        });
    });
}
let watcher = undefined;
function loadEnv(envName) {
    return __awaiter(this, void 0, void 0, function* () {
        const envDir = path_1.default.resolve(util_1.baseDirectory, 'envs', envName);
        const envDirExists = fs_1.default.existsSync(envDir);
        if (watcher !== undefined) {
            watcher.close();
            http_server_1.httpRouter.stack = [];
        }
        if (envDirExists) {
            const envFinfo = yield promises_1.default.stat(envDir).catch(e => { throw e; });
            if (envFinfo.isDirectory()) {
                reloadEnv(envDir);
                watcher = fs_1.default.watch(envDir, (ev, fname) => {
                    if (fname.endsWith('.json')) {
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