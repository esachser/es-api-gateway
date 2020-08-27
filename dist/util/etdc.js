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
exports.createEtcd = void 0;
const etcd3_1 = require("etcd3");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const logger_1 = require("./logger");
const config_1 = require("./config");
const ETCD_CONF_PATH = path_1.default.resolve(_1.baseDirectory, 'conf', 'etcd.json');
let ETCD_CLIENT;
// Lê configuração de arquivo no conf
function createEtcd() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!fs_1.default.existsSync(ETCD_CONF_PATH)) {
                fs_1.default.writeFileSync(ETCD_CONF_PATH, JSON.stringify({ hosts: 'http://localhost:2379' }));
            }
            const cfg = JSON.parse(fs_1.default.readFileSync(ETCD_CONF_PATH, { encoding: 'utf-8' }));
            ETCD_CLIENT = new etcd3_1.Etcd3(cfg);
            config_1.loadMasterWatcher();
        }
        catch (err) {
            logger_1.logger.error('Error loading ETCD', err);
            ETCD_CLIENT = new etcd3_1.Etcd3();
        }
    });
}
exports.createEtcd = createEtcd;
fs_1.default.watch(ETCD_CONF_PATH, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ETCD_CLIENT.close();
        createEtcd();
    }
    catch (err) {
        logger_1.logger.error('Error loading ETCD', err);
        ETCD_CLIENT = new etcd3_1.Etcd3();
    }
}));
function getEtcdClient() {
    return ETCD_CLIENT;
}
exports.default = getEtcdClient;
;
//# sourceMappingURL=etdc.js.map