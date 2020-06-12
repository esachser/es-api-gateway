import winston from 'winston';
import path from 'path';
import { baseDirectory } from '.';
import { configuration } from './config';

export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    defaultMeta: { service: 'es-apigw' },
    transports: [
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'combined.log') }),
        new winston.transports.Console()
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'exceptions.log') })
    ]
});

export function createLogger(level: string, api: string) {
    return winston.createLogger({
        level,
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        defaultMeta: { service: 'es-apigw', api },
        transports: [
            new winston.transports.File({ filename: path.resolve(baseDirectory, 'logs', 'apis', configuration.env, `${api}.log`), maxFiles:1, maxsize: 1024*1024 }),
        ],
    });
}
