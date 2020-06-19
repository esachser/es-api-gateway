"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsOAuth2Authenticator = void 0;
const vm_1 = __importDefault(require("vm"));
const errors_1 = require("../core/errors");
const authenticators_1 = require("../core/authenticators");
const lodash_1 = __importDefault(require("lodash"));
const vmContext = vm_1.default.createContext({
    '_': lodash_1.default,
    tokenObj: {},
    scopes: {}
}, {
    name: 'Context Middleware'
});
class EsOAuth2Authenticator extends authenticators_1.EsAuthenticator {
    constructor(name, id, scopesScript) {
        super(name, id);
        this._scopesScript = new vm_1.default.Script(String(scopesScript));
    }
    validate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = lodash_1.default.get(params, 'token');
            const scopesNeeded = lodash_1.default.get(params, 'scope');
            const res = yield this.verify(token);
            vmContext.tokenObj = res;
            this._scopesScript.runInContext(vmContext);
            const scopesHad = vmContext.scopes;
            // Se os escopos
            if (scopesNeeded !== undefined) {
                if (scopesHad === undefined) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
                if (!lodash_1.default.isArray(scopesNeeded)) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2Authenticator.name, 'scopes MUST be array');
                }
                if (!lodash_1.default.isArray(scopesHad)) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2Authenticator.name, 'scopes are not array');
                }
                if (scopesHad.length < scopesNeeded.length) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
                const containScopes = scopesNeeded.every(scope => scopesHad.includes(scope));
                if (!containScopes) {
                    throw new errors_1.EsAuthenticatorError(EsOAuth2Authenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
            }
            return res;
        });
    }
}
exports.EsOAuth2Authenticator = EsOAuth2Authenticator;
//# sourceMappingURL=oauth2-authenticator.js.map