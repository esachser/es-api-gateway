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
exports.getPrivateKey = exports.getPublicCert = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const _1 = require(".");
const config_1 = require("./config");
const keyv_1 = __importDefault(require("keyv"));
const util_1 = __importDefault(require("util"));
const fsasync = {
    stat: util_1.default.promisify(fs_1.default.stat),
    mkdir: util_1.default.promisify(fs_1.default.mkdir),
    writeFile: util_1.default.promisify(fs_1.default.writeFile),
    readFile: util_1.default.promisify(fs_1.default.readFile),
    unlink: util_1.default.promisify(fs_1.default.unlink)
};
const cacheFiles = new keyv_1.default({
    ttl: 60 * 60 * 1000,
});
function getPublicCert(api, certName) {
    return __awaiter(this, void 0, void 0, function* () {
        const fname = path_1.default.resolve(_1.baseDirectory, 'resources', config_1.configuration.env, api, certName);
        const fcontents = yield cacheFiles.get(fname);
        if (fcontents !== undefined) {
            return fcontents;
        }
        const fileContents = yield fsasync.readFile(fname, 'binary');
        cacheFiles.set(fname, fileContents);
        return fileContents;
    });
}
exports.getPublicCert = getPublicCert;
function getPrivateKey(api, certName, certPass) {
    return __awaiter(this, void 0, void 0, function* () {
        const fname = path_1.default.resolve(_1.baseDirectory, 'resources', config_1.configuration.env, api, certName);
        const fcontents = yield cacheFiles.get(`${certPass}::/::${fname}`);
        if (fcontents !== undefined) {
            return fcontents;
        }
        const fileContents = yield fsasync.readFile(fname, 'binary');
        const pem = node_forge_1.default.pem.decode(fileContents)[0];
        if (!pem.type.includes('PRIVATE')) {
            return undefined;
        }
        let pkStr;
        if (pem.type.includes('ENCRYPTED') && certPass !== undefined) {
            const privateKey = node_forge_1.default.pki.decryptRsaPrivateKey(fileContents, certPass);
            pkStr = node_forge_1.default.pki.privateKeyToPem(privateKey);
        }
        else {
            pkStr = fileContents;
        }
        cacheFiles.set(`${certPass}::/::${fname}`, pkStr);
        return pkStr;
    });
}
exports.getPrivateKey = getPrivateKey;
//# sourceMappingURL=certs.js.map