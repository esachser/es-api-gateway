import Ajv from 'ajv';
import { logger } from '../util/logger';

export const MIDDLEWARE_SCHEMA = {
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

export const TRANSPORT_SCHEMA = {
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

export const API_SCHEMA = {
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
}

let ajv = new Ajv();

export function loadJsonSchemaValidator() {
    try{
        ajv = ajv.addSchema(MIDDLEWARE_SCHEMA, 'es-middleware')
                 .addSchema(TRANSPORT_SCHEMA, 'es-transport')
                 .addSchema(API_SCHEMA, 'es-api');
    }
    catch (err) {
        logger.error(ajv.errorsText(ajv.errors), err);
    }
}

export function addNewSchema(name:string, schema:any) {
    if (ajv.getSchema(name) === undefined) {
        ajv.addSchema(schema, name);
    }
}

export async function validateObject(schemaName:string, obj:any): Promise<boolean> {
    try{
        const av = ajv.validate(schemaName, obj);
        const v = Boolean(av instanceof Promise ? await av.catch((e:any) => { throw e }) : av);
        if (!v) {
            logger.error(`Schema ${schemaName} with errors: ${ajv.errorsText(ajv.errors)}`);
        }
        return v;
    }
    catch (err) {
        logger.error(`Schema ${schemaName} with errors: ${ajv.errorsText(ajv.errors)}`, err);
    }
    return false;    
}

