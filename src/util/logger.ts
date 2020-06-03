import winston from 'winston';
import path from 'path';
import { baseDirectory } from '.';

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
