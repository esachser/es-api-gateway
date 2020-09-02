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
exports.delay = exports.readFileToObject = exports.baseDirectory = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const yaml_1 = __importDefault(require("yaml"));
exports.baseDirectory = path_1.default.resolve('.');
function readFileToObject(fname) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileContents = (yield promises_1.default.readFile(fname)).toString();
        const ext = path_1.default.extname(fname);
        if (ext === '.json') {
            return JSON.parse(fileContents);
        }
        else if (ext === '.yaml') {
            return yaml_1.default.parse(fileContents);
        }
    });
}
exports.readFileToObject = readFileToObject;
function delay(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
exports.delay = delay;
//# sourceMappingURL=index.js.map