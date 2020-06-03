"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var winston_1 = __importDefault(require("winston"));
var path_1 = __importDefault(require("path"));
var _1 = require(".");
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: 'es-apigw' },
    transports: [
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'error.log'), level: 'error' }),
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'combined.log') }),
        new winston_1.default.transports.Console()
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.resolve(_1.baseDirectory, 'logs', 'exceptions.log') })
    ]
});
//# sourceMappingURL=logger.js.map