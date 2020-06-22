import { IEsMiddleware, EsMiddleware, IEsContext, IEsMiddlewareConstructor } from '../core';
import _ from 'lodash';
import vm from 'vm';
import { EsMiddlewareError } from '../core/errors';


const vmContext = vm.createContext({
    '_': _,
    ctx: {},
    result: Error('result not set')
}, {
    name: 'ExecJs Middleware'
});

export class EsExecJsMiddleware extends EsMiddleware {
    static readonly isInOut = true;
    static readonly middlewareName = 'EsExecJsMiddleware';
    static readonly meta = { middleware: EsExecJsMiddleware.middlewareName };

    values: any;

    readonly vmScript?: vm.Script;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, after: boolean, nextMiddleware?: IEsMiddleware) {
        super(after, nextMiddleware);
        // Verifica values contra o esquema.
        this.values = values;

        // Se for uma expressão, prepara VMScript para rodar.
        const script = String(_.get(values, 'script', ''));

        try {
            this.vmScript = new vm.Script(script);
        }
        catch (err) {
            throw new EsMiddlewareError(EsExecJsMiddleware.middlewareName, 'Error compiling ExecJs script', err);
        }
    }

    async loadAsync() {}

    async runInternal(context: IEsContext) {
        if (this.vmScript !== undefined) {
            context.logger.debug(`Running script`, _.merge({}, EsExecJsMiddleware.meta, context.meta));
            vmContext.ctx = context;
            this.vmScript.runInContext(vmContext);
        }
    }
};

export const MiddlewareCtor: IEsMiddlewareConstructor = EsExecJsMiddleware;

export const MiddlewareSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsExecJsMiddleware",
    "title": "ExecJs Middleware",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "script"
    ],
    "properties": {
        "script": {
            "type": "string"
        }
    }
};

