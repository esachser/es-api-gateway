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
exports.getResourceStat = exports.getResourceFileStream = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const _1 = require(".");
const config_1 = require("./config");
const access = util_1.promisify(fs_1.default.access);
const stat = util_1.promisify(fs_1.default.stat);
const baseResourcesPath = path_1.default.resolve(_1.baseDirectory, 'resources');
function getResourceFileStream(filename, api) {
    return __awaiter(this, void 0, void 0, function* () {
        filename = filename.replace(new RegExp(`\\.\\.\\${path_1.default.sep}`, 'g'), '');
        const resourceAbsFile = api !== undefined ?
            path_1.default.resolve(baseResourcesPath, config_1.configuration.env, api, filename) :
            path_1.default.resolve(baseResourcesPath, config_1.configuration.env, filename);
        yield access(resourceAbsFile, fs_1.default.constants.R_OK);
        // Nesse ponto não estourou exceção, então temos acesso ao arquivo
        return fs_1.default.createReadStream(resourceAbsFile);
    });
}
exports.getResourceFileStream = getResourceFileStream;
function getResourceStat(filename, api) {
    return __awaiter(this, void 0, void 0, function* () {
        filename = filename.replace(new RegExp(`\\.\\.\\${path_1.default.sep}`, 'g'), '');
        const resourceAbsFile = api !== undefined ?
            path_1.default.resolve(baseResourcesPath, config_1.configuration.env, api, filename) :
            path_1.default.resolve(baseResourcesPath, config_1.configuration.env, filename);
        yield access(resourceAbsFile, fs_1.default.constants.R_OK);
        // Nesse ponto não estourou exceção, então temos acesso ao arquivo
        return stat(resourceAbsFile);
    });
}
exports.getResourceStat = getResourceStat;
//# sourceMappingURL=resources.js.map