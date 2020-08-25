import _ from 'lodash';
import { logger } from '../util/logger';
import { Logger, http } from 'winston';
import { nanoid } from 'nanoid';
import { EsTransportError, EsError } from '../core/errors';
import schedule from 'node-schedule';

import cluster from 'cluster';
import { IEsTransport, IEsTranportConstructor } from '../core/transports';
import { IEsMiddleware, connectMiddlewares } from '../core/middlewares';
import { IEsContext } from '../core';

let idSch: number | undefined = undefined
export function setIdScheduler(id: number) {
    idSch = id;
}

export class EsScheduleTransport implements IEsTransport {

    middleware: IEsMiddleware | undefined;

    apiLogger: Logger;

    api: string;

    tid: string;

    private _job: schedule.Job;

    /**
     *
     */
    constructor(params: any, api: string, tid: string, apiLogger: Logger, middleware: IEsMiddleware | undefined, initMiddleware?: IEsMiddleware) {
        // Verifica padrões
        this.apiLogger = apiLogger;
        this.api = api;
        this.tid = tid;
        this.middleware = connectMiddlewares(initMiddleware, middleware);

        const scheduleStr = _.get(params, 'schedule');

        try {
            this._job = schedule.scheduleJob(scheduleStr, async () => {
                
                // Roda somente em 1 worker
                if (idSch !== undefined && cluster.worker.id !== idSch) return;

                try {
                    logger.info(`Starting scheduled job (${scheduleStr}) for ${this.api}`);
                    let init = process.hrtime();
                    const context: IEsContext = {
                        properties: {},
                        logger: this.apiLogger,
                        meta: {
                            api,
                            transport: 'EsScheduleTransport',
                            uid: nanoid(12)
                        }
                    };
                    await this.middleware?.execute(context);
                    const diffs = process.hrtime(init);
                    const diff = diffs[0] * 1000 + diffs[1] / 1000000;
                    logger.info(`Ending scheduled job (${scheduleStr}) for ${this.api} in ${diff}ms`);
                }
                catch (err){
                    this.apiLogger.error('Error running middlewares', err);
                }
            });
            logger.info(`Loaded Schedule ${this.api} - ${this.tid}`);
        }
        catch (err) {
            throw new EsTransportError(EsScheduleTransport.name, 'Error scheduling', err);
        }
    }

    async loadAsync(params: any) {
    }

    clear() {
        this._job.cancel();
        delete this._job;
    }
}

export const TransportContructor: IEsTranportConstructor = EsScheduleTransport;

export const TransportSchema = {
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

