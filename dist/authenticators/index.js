"use strict";
//import { TransportContructor as EsHttpTransportContructor, TransportSchema as EsHttpTransportSchema } from './http';
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
exports.startAuthenticators = exports.loadAuthenticators = void 0;
const authenticators_1 = require("../core/authenticators");
const oauth2jwt_authenticator_1 = require("./oauth2jwt-authenticator");
const config_1 = require("../util/config");
const lodash_1 = __importDefault(require("lodash"));
const logger_1 = require("../util/logger");
function loadAuthenticators() {
    authenticators_1.addAuthenticatorConstructor('EsOAuth2JwtAuthenticator', oauth2jwt_authenticator_1.AuthenticatorContructor, oauth2jwt_authenticator_1.AuthenticatorSchema);
}
exports.loadAuthenticators = loadAuthenticators;
;
function startAuthenticators() {
    return __awaiter(this, void 0, void 0, function* () {
        const auths = lodash_1.default.get(config_1.configuration, 'authenticators', []);
        if (lodash_1.default.isArray(auths)) {
            for (const auth of auths) {
                const type = lodash_1.default.get(auth, 'type');
                const name = lodash_1.default.get(auth, 'name');
                const id = lodash_1.default.get(auth, 'id');
                const params = lodash_1.default.get(auth, 'parameters');
                yield authenticators_1.createAuthenticator(type, name, id, params);
            }
        }
        else {
            logger_1.logger.error('Authenticators not started because configuration is wrong. "authenticators" != Array');
        }
    });
}
exports.startAuthenticators = startAuthenticators;
//# sourceMappingURL=index.js.map