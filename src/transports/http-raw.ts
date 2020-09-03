import { getHttpRouter } from '../util/http-server-raw';
import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import { IEsContext } from '../core';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, createMiddleware, connectMiddlewares } from '../core/middlewares';
import url from 'url';
import Router from 'find-my-way';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface IEsHttpTransportParams {
    routeContext: string,
    routes: { [id: string]: Array<{ method: Method, mids: Array<any> }> },
    swagger?: any
};

export class EsHttpTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;
    initMiddleware: IEsMiddleware | undefined;

    routeContext: string;

    static baseRoutesUsed: Map<string, Set<string>> = new Map<string, Set<string>>();

    _routes: { method: string, path: string }[] = [];

    apiLogger: Logger;

    api: string;

    tid: string;

    /**
     *
     */
    constructor(params: IEsHttpTransportParams, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;

        if (!params.routeContext.endsWith('/')) {
            params.routeContext += '/';
        }

        // Procura estaticamente e testa se já existe
        const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        if (basePaths !== undefined) {
            for (const basePath of basePaths) {
                if (basePath.startsWith(params.routeContext) || params.routeContext.startsWith(basePath)) {
                    throw new Error(`Base route already exists. Exists ${basePath} x ${params.routeContext} New`);
                }
            }
            basePaths.add(params.routeContext);
        }
        else {
            EsHttpTransport.baseRoutesUsed.set(this.tid, new Set<string>([params.routeContext]));
        }

        this.middleware = middleware;
        this.initMiddleware = initMiddleware;
        this.routeContext = params.routeContext;
    }

    async loadAsync(params: IEsHttpTransportParams) {
        const httpRouter = getHttpRouter(this.tid);

        if (httpRouter === undefined) {
            throw new EsTransportError(EsHttpTransport.name, 'HttpRouter is undefined');
        }

        const routeContextSize = this.routeContext.length - 1;
        try {

            for (const path in params.routes) {
                let totalPath = `${this.routeContext}${path}`;
                totalPath = totalPath.replace(/\/{2,}/g, '/');

                for (const methodInfo of params.routes[path]) {
                    const pathMethodMid = await createMiddleware(methodInfo.mids, 0, this.api);
                    const middleware = connectMiddlewares(this.initMiddleware, pathMethodMid, this.middleware);
                    const method = methodInfo.method.toString().toUpperCase();
                    this._routes.push({ method, path: totalPath });
                    httpRouter.on(
                        method as Router.HTTPMethod,
                        totalPath,
                        async (request, reply, parms) => {
                            // Prepara a chamada
                            const api = this.api;
                            const urlParsed = url.parse(request.url ?? '',true)
                            let allPath = urlParsed.path ?? '';

                            if (!allPath.endsWith('/')) {
                                allPath += '/';
                            }
                            const context: IEsContext = {
                                properties: {
                                    request: {
                                        headers: request.headers,
                                        params: parms,
                                        query: urlParsed.query,
                                        path: allPath.substr(routeContextSize),
                                        method: request.method,
                                        routePrefix: this.routeContext
                                    },
                                    httpctx: {
                                        req: request
                                    }
                                },
                                body: '',
                                logger: this.apiLogger,
                                meta: {
                                    api,
                                    transport: 'EsHttpTransport',
                                    uid: nanoid(12)
                                }
                            };
                            try {
                                // Roda o que precisa
                                await middleware?.execute(context);
                                const headers = {
                                    ..._.get(context.properties, 'response.headers', {}),
                                    host: 'es-api-gateway 0.1.0'
                                }
                                const statusCode = _.get(context.properties, 'response.status');
                                const body = _.get(context.properties, 'response.body');
                                if (_.isPlainObject(body)){
                                    if (!Boolean(headers['content-type'])) {
                                        headers['content-type'] = 'application/json; charset=utf-8';
                                    }
                                    const bodySent = Buffer.from(JSON.stringify(body), 'utf8');
                                    if (!Boolean(headers['transfer-encoding'] === 'chunked')) {
                                        headers['content-length'] = bodySent.length;
                                    }
                                    reply.writeHead(_.isNumber(statusCode) ? statusCode : 404, headers);
                                    reply.end(bodySent);
                                }
                                else {
                                    const bodySent = _.isString(body) ? Buffer.from(body, 'utf8') : body;
                                    if (!Boolean(headers['transfer-encoding'] === 'chunked')) {
                                        headers['content-length'] = bodySent.length;
                                    }
                                    reply.writeHead(_.isNumber(statusCode) ? statusCode : 404, headers);
                                    reply.end(bodySent);
                                }                                    
                            }
                            catch (err) {
                                const headers = {
                                    ..._.get(context.properties, 'response.headers', {}),
                                    host: 'es-api-gateway 0.1.0',
                                    'content-type': 'application/json; charset=utf-8'
                                }
                                delete headers['content-encoding'];

                                if (err instanceof EsError && err.statusCode < 500) {
                                    reply.writeHead(err.statusCode, headers);
                                    reply.end(JSON.stringify({
                                        error: err.error,
                                        error_description: err.errorDescription
                                    }));
                                }
                                else {
                                    const nerr = err instanceof EsError ?
                                        new EsTransportError(EsHttpTransport.name, 'Error running middlewares', err) :
                                        new EsTransportError(EsHttpTransport.name, 'Error running middlewares', { message: err.message });

                                    reply.writeHead(nerr.statusCode, headers);
                                    reply.end(JSON.stringify({
                                        error: nerr.error,
                                        error_description: nerr.errorDescription
                                    }));
                                    err = nerr;
                                }
                                context.logger.error('Error running middlewares', _.merge({}, err, context.meta));
                            }
                        }
                    );
                }
            }
        }
        catch (err) {
            this.clear();
            throw new EsTransportError(EsHttpTransport.name, `Error loading transport HTTP for ${this.routeContext}`, err);
        }

        logger.info(`Loaded ${this.routeContext}`);
    }

    clear() {
        const httpRouter = getHttpRouter(this.tid);

        if (httpRouter === undefined) {
            return;
        }

        //httpRouter.stack = httpRouter.stack.filter(l => !l.path.startsWith(this.routeContext));
        for (const r of this._routes) {
            httpRouter.off(r.method as any, r.path);
        }

        this._routes = [];
        const basePaths = EsHttpTransport.baseRoutesUsed.get(this.tid);
        if (basePaths !== undefined) {
            basePaths.delete(this.routeContext);
        }
        logger.info(`Clear ${this.routeContext} executed`);
        logger.debug(httpRouter.prettyPrint());
    }
}

export const TransportContructor: IEsTranportConstructor = EsHttpTransport;

export const TransportSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsHttpTransport",
    "title": "Http Transport parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "routeContext",
        "routes"
    ],
    "properties": {
        "routes": {
            "type": "object",
            "additionalProperties": false,
            "patternProperties": {
                "^\\/([a-z0-9\\-._~%!$&'()*+,;=:@/]*)$": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "method": {
                                "type": "string",
                                "enum": ["GET", "POST", "PATCH", "PUT", "DELETE"]
                            },
                            "mids": {
                                "type": "array",
                                "items": {
                                    "$ref": "es-middleware"
                                }
                            }
                        }
                    }
                }
            }
        },
        "routeContext": {
            "type": "string"
        }
    }
};

