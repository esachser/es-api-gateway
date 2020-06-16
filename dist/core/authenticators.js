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
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthenticators = exports.removeAuthenticator = exports.getAuthenticator = exports.createAuthenticator = exports.getAuthenticatorConstructor = exports.addAuthenticatorConstructor = exports.EsAuthenticator = void 0;
const logger_1 = require("../util/logger");
const schemas_1 = require("./schemas");
const errors_1 = require("./errors");
class EsAuthenticator {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
}
exports.EsAuthenticator = EsAuthenticator;
const authenticators = {};
function addAuthenticatorConstructor(type, constructor, parameters) {
    try {
        logger_1.logger.info(`Loading ${type} Authenticator`);
        authenticators[type] = constructor;
        schemas_1.addNewSchema(type, parameters);
    }
    catch (err) {
        logger_1.logger.error(`Error loading middleware ${type} -- `, err);
    }
}
exports.addAuthenticatorConstructor = addAuthenticatorConstructor;
function getAuthenticatorConstructor(type) {
    return authenticators[type];
}
exports.getAuthenticatorConstructor = getAuthenticatorConstructor;
const authenticatorObjs = new Map;
function createAuthenticator(type, name, id, parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        if (authenticatorObjs.get(id) !== undefined) {
            throw new errors_1.EsAuthenticatorError(type, `Id ${id} already in use`);
        }
        const ctor = getAuthenticatorConstructor(type);
        if (ctor === undefined) {
            throw new errors_1.EsAuthenticatorError(type, `Constructor of ${type} doesnt exists`);
        }
        const v = yield schemas_1.validateObject(type, parameters);
        if (!v) {
            throw new errors_1.EsAuthenticatorError(type, `${type} parameters are invalid`);
        }
        const authenticator = new ctor(name, id, parameters);
        yield authenticator.loadAsync(parameters);
        authenticatorObjs.set(id, authenticator);
        return authenticator;
    });
}
exports.createAuthenticator = createAuthenticator;
function getAuthenticator(id) {
    return authenticatorObjs.get(id);
}
exports.getAuthenticator = getAuthenticator;
function removeAuthenticator(id) {
    authenticatorObjs.delete(id);
}
exports.removeAuthenticator = removeAuthenticator;
function clearAuthenticators() {
    authenticatorObjs.clear();
}
exports.clearAuthenticators = clearAuthenticators;
//# sourceMappingURL=authenticators.js.map