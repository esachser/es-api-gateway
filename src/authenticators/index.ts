//import { TransportContructor as EsHttpTransportContructor, TransportSchema as EsHttpTransportSchema } from './http';

import { addAuthenticatorConstructor, createAuthenticator, clearAuthenticators } from "../core/authenticators";
import { AuthenticatorContructor as EsOAuth2JwtAuthenticatorConstructor, AuthenticatorSchema as EsOAuth2JwtAuthenticatorSchema } from './oauth2jwt-authenticator';
import { AuthenticatorContructor as EsOAuth2InspectAuthenticatorConstructor, AuthenticatorSchema as EsOAuth2InspectAuthenticatorSchema } from './oauth2inspect-authenticator';
import { configuration } from "../util/config";
import _ from "lodash";
import { EsAuthenticatorError } from "../core/errors";
import { logger } from "../util/logger";


export function loadAuthenticators() {
    addAuthenticatorConstructor('EsOAuth2JwtAuthenticator', EsOAuth2JwtAuthenticatorConstructor, EsOAuth2JwtAuthenticatorSchema);
    addAuthenticatorConstructor('EsOAuth2InspectAuthenticator', EsOAuth2InspectAuthenticatorConstructor, EsOAuth2InspectAuthenticatorSchema);

};

export async function startAuthenticators() {
    clearAuthenticators();
    const auths = _.get(configuration, 'authenticators', []);
    if (_.isArray(auths)) {
        for (const auth of auths) {
            const type = _.get(auth, 'type');
            const name = _.get(auth, 'name');
            const id = _.get(auth, 'id');
            const params = _.get(auth, 'parameters');
            await createAuthenticator(type, name, id, params);
        }
    }
    else {
        logger.error('Authenticators not started because configuration is wrong. "authenticators" != Array');
    }
}

