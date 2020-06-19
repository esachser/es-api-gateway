import vm from 'vm';
import { EsAuthenticatorError } from '../core/errors';
import { EsAuthenticator } from '../core/authenticators';
import _ from 'lodash';

const vmContext = vm.createContext({
    '_': _,
    tokenObj: {},
    scopes: {}
}, {
    name: 'Context Middleware'
});

export abstract class EsOAuth2Authenticator extends EsAuthenticator {
    protected _scopesScript: vm.Script

    constructor(name: string, id: string, scopesScript: string) {
        super(name, id);
        this._scopesScript = new vm.Script(String(scopesScript));
    }

    protected abstract verify(token: string): Promise<any>

    async validate(params: any) {
        const token = _.get(params, 'token');
        const scopesNeeded = _.get(params, 'scope');

        const res = await this.verify(token);
        vmContext.tokenObj = res;
        this._scopesScript.runInContext(vmContext);
        const scopesHad = vmContext.scopes;
        
        // Se os escopos
        if (scopesNeeded !== undefined) {
            if (scopesHad === undefined) {
                throw new EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }

            if (!_.isArray(scopesNeeded)) {
                throw new EsAuthenticatorError(EsOAuth2Authenticator.name, 'scopes MUST be array');
            }

            if (!_.isArray(scopesHad)) {
                throw new EsAuthenticatorError(EsOAuth2Authenticator.name, 'scopes are not array');
            }

            if (scopesHad.length < scopesNeeded.length) {
                throw new EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }

            const containScopes = scopesNeeded.every(scope => scopesHad.includes(scope));

            if (!containScopes) {
                throw new EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
            }
        }

        return res;
    }
}