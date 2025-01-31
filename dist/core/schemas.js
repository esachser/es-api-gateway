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
exports.validateObject = exports.addNewSchema = exports.loadJsonSchemaValidator = exports.API_SCHEMA = exports.TRANSPORT_SCHEMA = exports.MIDDLEWARE_SCHEMA = void 0;
const ajv_1 = __importDefault(require("ajv"));
const logger_1 = require("../util/logger");
const errors_1 = require("./errors");
exports.MIDDLEWARE_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/es-middleware",
    "title": "IEsMiddleware Schema",
    "type": "object",
    "additionalProperties": false,
    "required": [
        "type",
        "data"
    ],
    "properties": {
        "type": {
            "type": "string"
        },
        "data": {
            "type": "object"
        },
        "after": {
            "type": "boolean"
        }
    }
};
exports.TRANSPORT_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/es-transport",
    "additionalProperties": false,
    "title": "IEsTransport Schema",
    "type": "object",
    "required": [
        "type",
        "id",
        "parameters",
        "mids"
    ],
    "properties": {
        "type": {
            "type": "string"
        },
        "id": {
            "type": "string"
        },
        "parameters": {
            "type": "object"
        },
        "mids": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        },
        "enabled": {
            "type": "boolean"
        }
    }
};
exports.API_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://esachser.github.io/es-apigw/v1/schemas/es-api",
    "title": "IEsTransport Schema",
    "type": "object",
    "required": [
        "transports",
        "execution",
        "logging"
    ],
    "properties": {
        "transports": {
            "type": "array",
            "items": {
                "$ref": "es-transport"
            }
        },
        "init": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        },
        "execution": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        },
        "logging": {
            "type": "object",
            "required": [
                "level"
            ],
            "properties": {
                "level": {
                    "type": "string"
                }
            }
        },
        "enabled": {
            "type": "boolean"
        }
    }
};
let ajv = new ajv_1.default();
function loadJsonSchemaValidator() {
    try {
        ajv = ajv.addSchema(exports.MIDDLEWARE_SCHEMA, 'es-middleware')
            .addSchema(exports.TRANSPORT_SCHEMA, 'es-transport')
            .addSchema(exports.API_SCHEMA, 'es-api');
    }
    catch (err) {
        logger_1.logger.error(ajv.errorsText(ajv.errors), err);
    }
}
exports.loadJsonSchemaValidator = loadJsonSchemaValidator;
function addNewSchema(name, schema) {
    if (ajv.getSchema(name) === undefined) {
        ajv.addSchema(schema, name);
    }
}
exports.addNewSchema = addNewSchema;
function validateObject(schemaName, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const av = ajv.validate(schemaName, obj);
            const v = Boolean(av instanceof Promise ? yield av.catch((e) => { throw e; }) : av);
            if (!v) {
                throw new errors_1.EsSchemaError(schemaName, ajv.errorsText(ajv.errors));
            }
            return v;
        }
        catch (err) {
            throw new errors_1.EsSchemaError(schemaName, ajv.errorsText(ajv.errors), err);
        }
        return false;
    });
}
exports.validateObject = validateObject;
//# sourceMappingURL=schemas.js.map