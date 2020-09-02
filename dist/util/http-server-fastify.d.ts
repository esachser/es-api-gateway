/// <reference types="node" />
/// <reference types="node/http" />
/// <reference types="got/dist/source/core/utils/timed-out" />
import { FastifyInstance } from 'fastify';
export declare function getHttpRouter(id: string): FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse, import("fastify").FastifyLoggerInstance> | undefined;
export declare function clearRouters(): void;
export declare function runServers(): Promise<void>;
export declare function loadHttpServer(conf: any): Promise<void>;
export declare function loadHttpServers(): Promise<void>;
