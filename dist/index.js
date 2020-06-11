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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./util/config");
const middlewares_1 = require("./middlewares");
const logger_1 = require("./util/logger");
const transports_1 = require("./transports");
const envs_1 = require("./envs");
const http_server_1 = require("./util/http-server");
const schemas_1 = require("./core/schemas");
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield config_1.loadConfig().catch(e => { throw e; });
        middlewares_1.loadMiddlewares();
        middlewares_1.loadCustomMiddlewares();
        transports_1.loadTransports();
        transports_1.loadCustomTransports();
        http_server_1.loadHttpServer();
        schemas_1.loadJsonSchemaValidator();
        yield envs_1.loadEnv(config_1.configuration.env).catch(e => { throw e; });
    });
}
start().catch(e => {
    logger_1.logger.error('General error', e);
});
//# sourceMappingURL=index.js.map