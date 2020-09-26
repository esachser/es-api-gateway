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
exports.AuthenticatorSchema = exports.AuthenticatorContructor = exports.EsBasicAuthenticator = void 0;
const lodash_1 = __importDefault(require("lodash"));
const authenticators_1 = require("../core/authenticators");
const errors_1 = require("../core/errors");
const dbKnex_1 = require("../util/dbKnex");
class EsBasicAuthenticator extends authenticators_1.EsAuthenticator {
    constructor(name, id, params) {
        super(name, id);
        this._findQuery = String(lodash_1.default.get(params, 'findQuery'));
        this._roleQuery = String(lodash_1.default.get(params, 'roleQuery'));
        this._userColumn = String(lodash_1.default.get(params, 'userColumn'));
        this._roleColumn = String(lodash_1.default.get(params, 'roleColumn'));
        const dbId = String(lodash_1.default.get(params, 'dbId'));
        this._db = dbKnex_1.getDatabaseConnection(dbId);
        if (this._db === undefined) {
            throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, `Database with id ${dbId} not found`);
        }
    }
    loadAsync() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    verify(tokenStr) {
        return __awaiter(this, void 0, void 0, function* () {
            // Procura no db
            const credentials = Buffer.from(tokenStr, 'base64').toString('utf-8').split(':');
            const search = yield this._db.raw(this._findQuery, credentials).then(r => r);
            const user = search[0][0];
            if (user === undefined || user === null) {
                throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'Invalid credentials provided', 401);
            }
            return user;
        });
    }
    validate(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = lodash_1.default.get(params, 'token');
            const roleNeeded = lodash_1.default.get(params, 'scope');
            const res = yield this.verify(token);
            // Se os escopos
            if (roleNeeded !== undefined) {
                const rolesQuery = yield this._db.raw(this._roleQuery, [lodash_1.default.get(res, this._userColumn)]).then(r => r);
                const roles = rolesQuery[0].map((r) => r[this._roleColumn]);
                if (roles === undefined) {
                    throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
                if (!lodash_1.default.isArray(roleNeeded)) {
                    throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'scopes MUST be array');
                }
                if (!lodash_1.default.isArray(roles)) {
                    throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'scopes are not array');
                }
                if (roles.length < roleNeeded.length) {
                    throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
                const containScopes = roleNeeded.every(scope => roles.includes(scope));
                if (!containScopes) {
                    throw new errors_1.EsAuthenticatorError(EsBasicAuthenticator.name, 'Key error', undefined, 'No scopes for that resource', 401);
                }
                res.roles = roles;
            }
            return res;
        });
    }
}
exports.EsBasicAuthenticator = EsBasicAuthenticator;
exports.AuthenticatorContructor = EsBasicAuthenticator;
exports.AuthenticatorSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/EsBasicAuthenticator",
    "title": "OAuth2 Inspect Authenticator parameters",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "findQuery",
        "roleQuery",
        "userColumn",
        "roleColumn",
        "dbId"
    ],
    "properties": {
        "findQuery": {
            "type": "string",
            "minLength": 1
        },
        "roleQuery": {
            "type": "string",
            "minLength": 1
        },
        "userColumn": {
            "type": "string",
            "minLength": 1
        },
        "roleColumn": {
            "type": "string",
            "minLength": 1
        },
        "dbId": {
            "type": "string",
            "minLength": 1
        }
    }
};
//# sourceMappingURL=basic-authenticator.js.map