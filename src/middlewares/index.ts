import decache from 'decache';
import fs from 'fs';
import { logger } from '../util/logger';
import { MiddlewareCtor as EsPropertyMiddlewareContructor, MiddlewareSchema as EsPropertySchema } from './property-middleware';
import { MiddlewareCtor as EsMetricsMiddlewareContructor, MiddlewareSchema as EsMetricsSchema } from './metrics-middleware';
import { MiddlewareCtor as EsParallelMiddlewareContructor, MiddlewareSchema as EsParallelSchema } from './parallel-middleware';
import { MiddlewareCtor as EsSequenceMiddlewareContructor, MiddlewareSchema as EsSequenceSchema } from './sequence-middleware';
import { MiddlewareCtor as EsConditionMiddlewareContructor, MiddlewareSchema as EsConditionSchema } from './condition-middleware';
import { MiddlewareCtor as EsHttpRequestMiddlewareContructor, MiddlewareSchema as EsHttpRequestSchema } from './httprequest-middleware';
import { MiddlewareCtor as EsOpenApiVerifyMiddlewareContructor, MiddlewareSchema as EsOpenApiVerifySchema } from './openapiverify-middleware';
import { MiddlewareCtor as EsThrowMiddlewareContructor, MiddlewareSchema as EsThrowSchema } from './throw-middleware';
import { MiddlewareCtor as EsCatchMiddlewareContructor, MiddlewareSchema as EsCatchSchema } from './catch-middleware';
import { MiddlewareCtor as EsAuthenticateMiddlewareContructor, MiddlewareSchema as EsAuthenticateSchema } from './authenticate-middleware';
import { MiddlewareCtor as EsExecJsMiddlewareContructor, MiddlewareSchema as EsExecJsSchema } from './execjs-middleware';
import { MiddlewareCtor as EsDecodeMiddlewareContructor, MiddlewareSchema as EsDecodeSchema } from './decode-middleware';
import { MiddlewareCtor as EsEncodeMiddlewareContructor, MiddlewareSchema as EsEncodeSchema } from './encode-middleware';
import { MiddlewareCtor as EsGrpcRequestMiddlewareContructor, MiddlewareSchema as EsGrpcRequestSchema } from './grpcrequest-middleware';
import { MiddlewareCtor as EsLoadPrivateKeyMiddlewareContructor, MiddlewareSchema as EsLoadPrivateKeySchema } from './loadprivatekey-middleware';
import { MiddlewareCtor as EsLoadPublicCertificateMiddlewareContructor, MiddlewareSchema as EsLoadPublicCertificateSchema } from './loadpubliccertificate-middleware';
import { MiddlewareCtor as EsJwsGenerateMiddlewareContructor, MiddlewareSchema as EsJwsGenerateSchema } from './jwsgenerate-middleware';
import { MiddlewareCtor as EsJwsVerifyMiddlewareContructor, MiddlewareSchema as EsJwsVerifySchema } from './jwsverify-middleware';
import { MiddlewareCtor as EsJweGenerateMiddlewareContructor, MiddlewareSchema as EsJweGenerateSchema } from './jwegenerate-middleware';
import { MiddlewareCtor as EsJweVerifyMiddlewareContructor, MiddlewareSchema as EsJweVerifySchema } from './jweverify-middleware';
import { MiddlewareCtor as EsRedisSetMiddlewareContructor, MiddlewareSchema as EsRedisSetSchema } from './redisset-middleware';
import { MiddlewareCtor as EsRedisGetMiddlewareContructor, MiddlewareSchema as EsRedisGetSchema } from './redisget-middleware';
import { MiddlewareCtor as EsRateLimiterMiddlewareContructor, MiddlewareSchema as EsRateLimiterSchema } from './ratelimiter-middleware';
import { addMiddleware } from '../core/middlewares';

function readDirectoryProjects(dir: string) {
    const finfos = fs.readdirSync(dir, { withFileTypes: true });

    finfos.forEach(finfo => {
        if (finfo.isDirectory()) {
            logger.info(`Loading middleware ${finfo.name}`);
            
        }
    });
}

export function loadMiddlewares() {
    //readDirectoryProjects(path.resolve(baseDirectory, 'middlewares'));
    addMiddleware('EsPropertyMiddleware', EsPropertyMiddlewareContructor, EsPropertySchema);
    addMiddleware('EsMetricsMiddleware', EsMetricsMiddlewareContructor, EsMetricsSchema);
    addMiddleware('EsParallelMiddleware', EsParallelMiddlewareContructor, EsParallelSchema);
    addMiddleware('EsSequenceMiddleware', EsSequenceMiddlewareContructor, EsSequenceSchema);
    addMiddleware('EsConditionMiddleware', EsConditionMiddlewareContructor, EsConditionSchema);
    addMiddleware('EsHttpRequestMiddleware', EsHttpRequestMiddlewareContructor, EsHttpRequestSchema);
    addMiddleware('EsOpenApiVerifyMiddleware', EsOpenApiVerifyMiddlewareContructor, EsOpenApiVerifySchema);
    addMiddleware('EsThrowMiddleware', EsThrowMiddlewareContructor, EsThrowSchema);
    addMiddleware('EsCatchMiddleware', EsCatchMiddlewareContructor, EsCatchSchema);
    addMiddleware('EsAuthenticateMiddleware', EsAuthenticateMiddlewareContructor, EsAuthenticateSchema);
    addMiddleware('EsExecJsMiddleware', EsExecJsMiddlewareContructor, EsExecJsSchema);
    addMiddleware('EsDecodeMiddleware', EsDecodeMiddlewareContructor, EsDecodeSchema);
    addMiddleware('EsEncodeMiddleware', EsEncodeMiddlewareContructor, EsEncodeSchema);
    addMiddleware('EsGrpcRequestMiddleware', EsGrpcRequestMiddlewareContructor, EsGrpcRequestSchema);
    addMiddleware('EsLoadPrivateKeyMiddleware', EsLoadPrivateKeyMiddlewareContructor, EsLoadPrivateKeySchema);
    addMiddleware('EsLoadPublicCertificateMiddleware', EsLoadPublicCertificateMiddlewareContructor, EsLoadPublicCertificateSchema);
    addMiddleware('EsJwsGenerateMiddleware', EsJwsGenerateMiddlewareContructor, EsJwsGenerateSchema);
    addMiddleware('EsJwsVerifyMiddleware', EsJwsVerifyMiddlewareContructor, EsJwsVerifySchema);
    addMiddleware('EsJweGenerateMiddleware', EsJweGenerateMiddlewareContructor, EsJweGenerateSchema);
    addMiddleware('EsJweVerifyMiddleware', EsJweVerifyMiddlewareContructor, EsJweVerifySchema);
    addMiddleware('EsRedisSetMiddleware', EsRedisSetMiddlewareContructor, EsRedisSetSchema);
    addMiddleware('EsRedisGetMiddleware', EsRedisGetMiddlewareContructor, EsRedisGetSchema);
    addMiddleware('EsRateLimiterMiddleware', EsRateLimiterMiddlewareContructor, EsRateLimiterSchema);
};

export function loadCustomMiddlewares() {
    // Limpa cache dos custom
    logger.info('Removing all custom middlewares');
    Object.keys(require.cache).filter(s => s.startsWith('./custom/middlewares/')).forEach(k => {
        logger.info(`Removing cache entry ${k}`);
        decache(k);
    });
};