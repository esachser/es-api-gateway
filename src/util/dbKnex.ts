import knex from 'knex';

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
