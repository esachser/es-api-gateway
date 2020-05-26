import { IEsTransport, EsParameters, IEsMiddleware, IEsContext, IEsTranportConstructor } from '../core';
import { httpRouter } from '../util/http-server';
import mount from 'koa-mount';
import lodash from 'lodash';

export class EsHttpTransport implements IEsTransport {
    parameters: EsParameters = {
        'routeContext': {
            type: 'string',
            optional: false
        }
    };
    preMiddleware: IEsMiddleware | undefined;
    posMiddleware: IEsMiddleware | undefined;
    central: IEsMiddleware | undefined;

    routeContext: string;

    /**
     *
     */
    constructor(params: any, pre: IEsMiddleware | undefined, pos: IEsMiddleware | undefined, central: IEsMiddleware | undefined) {
        // Verifica padrões
        this.preMiddleware = pre;
        this.posMiddleware = pos;
        this.routeContext = params.routeContext;
        this.central = central;

        httpRouter.get(this.routeContext, async ctx => {
            // Prepara a chamada
            const context: IEsContext = {
                properties: {
                    httpctx: ctx,
                    headers: ctx.request.headers,
                },
                parsedbody: ctx.request.body,
                rawbody: ctx.request.rawBody
            }

            // Executa os middlewares iniciais
            await this.preMiddleware?.execute(context);

            // Executa middleware central
            await this.central?.execute(context);

            // Executa o final
            await this.posMiddleware?.execute(context);

            // Captura resultados e escreve a resposta

            ctx.set(lodash.get(context.properties, 'response.headers') || {});
            ctx.status = lodash.get(context.properties, 'response.status');
            ctx.body = lodash.get(context.properties, 'response.body');
        });
    }
} 

export const EsHttpTransportContructor: IEsTranportConstructor = EsHttpTransport;