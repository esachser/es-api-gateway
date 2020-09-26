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
exports.loadDatabaseConnections = exports.deleteDatabaseConnection = exports.getDatabaseConnection = exports.addDatabaseConnection = void 0;
const knex_1 = __importDefault(require("knex"));
const lodash_1 = __importDefault(require("lodash"));
const config_1 = require("./config");
const dbConnections = {};
function addDatabaseConnection(id, config) {
    if (dbConnections[id] !== undefined) {
        throw new Error(`Connection with id ${id} already exists`);
    }
    dbConnections[id] = knex_1.default(config);
}
exports.addDatabaseConnection = addDatabaseConnection;
function getDatabaseConnection(id) {
    return dbConnections[id];
}
exports.getDatabaseConnection = getDatabaseConnection;
function deleteDatabaseConnection(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dbConnections[id] !== undefined) {
            yield dbConnections[id].destroy();
        }
        delete dbConnections[id];
    });
}
exports.deleteDatabaseConnection = deleteDatabaseConnection;
function loadDatabaseConnections() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const confConnections = (_a = config_1.configuration.dbConnections) !== null && _a !== void 0 ? _a : [];
        for (const conf of confConnections) {
            const id = lodash_1.default.get(conf, 'id');
            const cnf = lodash_1.default.get(conf, 'conf');
            yield deleteDatabaseConnection(id);
            addDatabaseConnection(id, cnf);
        }
    });
}
exports.loadDatabaseConnections = loadDatabaseConnections;
//# sourceMappingURL=dbKnex.js.map