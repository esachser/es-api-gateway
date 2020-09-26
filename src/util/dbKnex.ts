import knex from 'knex';
import _ from 'lodash';
import { configuration } from './config';

const dbConnections: {[index: string]: knex} = {};

export function addDatabaseConnection(id: string, config: any) {
    if (dbConnections[id] !== undefined) {
        throw new Error(`Connection with id ${id} already exists`);
    }

    dbConnections[id] = knex(config);
}

export function getDatabaseConnection(id:string) {
    return dbConnections[id];
}

export async function deleteDatabaseConnection(id: string) {
    if (dbConnections[id] !== undefined) {
        await dbConnections[id].destroy();
    }
    delete dbConnections[id];
}

export async function loadDatabaseConnections() {
    const confConnections = configuration.dbConnections ?? [];
    for(const conf of confConnections) {
        const id = _.get(conf, 'id');
        const cnf = _.get(conf, 'conf');

        await deleteDatabaseConnection(id);
        addDatabaseConnection(id, cnf);
    }
}
