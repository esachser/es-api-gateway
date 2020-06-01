import { IEsMiddleware, IEsContext, EsParameters, IEsMiddlewareConstructor, IEsMiddlewareParams } from '../core';
import lodash from 'lodash';
import { NodeVM, VMScript } from 'vm2';
import { logger } from '../util/logger';
import stringifyObject from 'stringify-object';

const vm = new NodeVM();

export class EsPropertyMiddleware implements IEsMiddleware {
    static readonly parameters: EsParameters = {
        'name': {
            type: 'string',
            optional: false
        },
        'value': {
            type: 'any',
            optional: true
        },
        'expression': {
            type: 'string',
            optional: true
        },
        'runAfter': {
            type: 'boolean',
            optional: true,
            defaultValue: false
        }
    };
    static readonly isInOut = true;

    values: any;

    next?: IEsMiddleware;

    readonly vmScript: VMScript;

    /**
     * Constrói o middleware a partir dos parâmetros
     */
    constructor(values: any, nextMiddleware?: IEsMiddleware) {
        // Verifica values contra o esquema.
        this.values = values;
        this.next = nextMiddleware;

        // Se for uma expressão, prepara VMScript para rodar.
        let script = '';
        if (values['value'] === undefined &&
            values['expression'] !== undefined) {
            
            script += `module.exports=function(props){return ${values['expression']};}`;
        }
        // Senão, prepara VMScript para somente devolver o valor
        else {
            script += `module.exports=function(props){return ${stringifyObject(values['value'])};}`;
        }
        logger.debug(`script: ${script}`);

        try {
            this.vmScript = new VMScript(script).compile();
        }
        catch (err) {
            logger.error({error: err, script});
            this.vmScript = new VMScript('{}').compile();
        }

        logger.debug(vm.run(this.vmScript));
    }

    async execute(context: IEsContext) {
        const runAfter = lodash.get(this.values, 'runAfter') || false;
        vm.freeze(context.properties, 'props');
        if (runAfter) {
            await this.next?.execute(context);
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
        }
        else {
            lodash.set(context.properties, this.values['name'], vm.run(this.vmScript)(context.properties));
            await this.next?.execute(context);
        }
    }
};

export const EsPropertyMiddlwareParams: IEsMiddlewareParams = EsPropertyMiddleware;

export const EsPropertyMiddlewareContructor: IEsMiddlewareConstructor = EsPropertyMiddleware;

