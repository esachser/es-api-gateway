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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateObject = exports.addNewSchema = exports.loadJsonSchemaValidator = exports.API_SCHEMA = exports.TRANSPORT_SCHEMA = exports.MIDDLEWARE_SCHEMA = void 0;
var ajv_1 = __importDefault(require("ajv"));
var logger_1 = require("../util/logger");
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
        "execution"
    ],
    "properties": {
        "transports": {
            "type": "array",
            "items": {
                "$ref": "es-transport"
            }
        },
        "execution": {
            "type": "array",
            "items": {
                "$ref": "es-middleware"
            }
        }
    }
};
var ajv = new ajv_1.default();
function loadJsonSchemaValidator() {
    try {
        ajv = ajv.addSchema(exports.MIDDLEWARE_SCHEMA, 'es-middleware')
            .addSchema(exports.TRANSPORT_SCHEMA, 'es-transport')
            .addSchema(exports.API_SCHEMA, 'es-api');
    }
    catch (err) {
        logger_1.logger.error(err);
        logger_1.logger.error(ajv.errorsText(ajv.errors));
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
    return __awaiter(this, void 0, void 0, function () {
        var v, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, ajv.validate(schemaName, obj)];
                case 1:
                    v = _a.sent();
                    if (!v) {
                        logger_1.logger.error(ajv.errorsText(ajv.errors));
                    }
                    return [2 /*return*/, v];
                case 2:
                    err_1 = _a.sent();
                    logger_1.logger.error(err_1);
                    logger_1.logger.error(ajv.errorsText(ajv.errors));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, false];
            }
        });
    });
}
exports.validateObject = validateObject;
//# sourceMappingURL=schemas.js.map