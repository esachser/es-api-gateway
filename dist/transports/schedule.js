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
exports.TransportSchema = exports.TransportContructor = exports.EsScheduleTransport = exports.setIdScheduler = void 0;
const core_1 = require("../core");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
const nanoid_1 = require("nanoid");
const errors_1 = require("../core/errors");
const node_schedule_1 = __importDefault(require("node-schedule"));
const cluster_1 = __importDefault(require("cluster"));
let idSch = undefined;
function setIdScheduler(id) {
    idSch = id;
}
exports.setIdScheduler = setIdScheduler;
class EsScheduleTransport {
    /**
     *
     */
    constructor(params, api, tid, apiLogger, middleware, initMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = core_1.connectMiddlewares(initMiddleware, middleware);
        const scheduleStr = lodash_1.default.get(params, 'schedule');
        try {
            this._job = node_schedule_1.default.scheduleJob(scheduleStr, () => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Roda somente em 1 worker
                if (idSch !== undefined && cluster_1.default.worker.id !== idSch)
                    return;
                try {
                    logger_1.logger.info(`Starting scheduled job (${scheduleStr}) for ${this.api}`);
                    let init = process.hrtime();
                    const context = {
                        properties: {},
                        logger: this.apiLogger,
                        meta: {
                            api,
                            transport: 'EsScheduleTransport',
                            uid: nanoid_1.nanoid(12)
                        }
                    };
                    yield ((_a = this.middleware) === null || _a === void 0 ? void 0 : _a.execute(context));
                    const diffs = process.hrtime(init);
                    const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                    logger_1.logger.info(`Ending scheduled job (${scheduleStr}) for ${this.api} in ${diff}ms`);
                }
                catch (err) {
                    this.apiLogger.error('Error running middlewares', err);
                }
            }));
            logger_1.logger.info(`Loaded Schedule ${this.api} - ${this.tid}`);
        }
        catch (err) {
            throw new errors_1.EsTransportError(EsScheduleTransport.name, 'Error scheduling', err);
        }
    }
    loadAsync(params) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    clear() {
        this._job.cancel();
        delete this._job;
    }
}
exports.EsScheduleTransport = EsScheduleTransport;
exports.TransportContructor = EsScheduleTransport;
exports.TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsScheduleTransport",
    "title": "Schedule Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "schedule"
    ],
    "properties": {
        "schedule": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=schedule.js.map