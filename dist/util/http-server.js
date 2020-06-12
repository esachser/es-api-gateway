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
exports.loadHttpServer = exports.httpRouter = void 0;
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const koa_helmet_1 = __importDefault(require("koa-helmet"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const config_1 = require("./config");
const logger_1 = require("./logger");
exports.httpRouter = new koa_router_1.default();
function loadHttpServer() {
    const app = new koa_1.default();
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        // Avaliando tempo de execução total da aplicação koa
        let init = Date.now();
        yield next();
        let diff = Date.now() - init;
        logger_1.logger.debug(`Total app process time: ${diff}ms`);
    }));
    app.use(koa_helmet_1.default());
    app.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
        yield next();
        if (ctx.status === 404 && ctx.body === undefined) {
            ctx.body = {
                error: 'Not Found'
            };
        }
    }));
    app.use(koa_bodyparser_1.default());
    app.use(exports.httpRouter.routes()).use(exports.httpRouter.allowedMethods());
    const server = app.listen(config_1.configuration.httpPort || 3000, () => {
        const { port } = server.address();
        logger_1.logger.info(`Http Server running on port ${port}`);
    });
    app.on('error', (err, ctx) => {
        logger_1.logger.error('Erro no servidor HTTP', err);
    });
}
exports.loadHttpServer = loadHttpServer;
//# sourceMappingURL=http-server.js.map