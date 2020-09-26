import knex from 'knex';
export declare function addDatabaseConnection(id: string, config: any): void;
export declare function getDatabaseConnection(id: string): knex<any, unknown[]>;
export declare function deleteDatabaseConnection(id: string): Promise<void>;
export declare function loadDatabaseConnections(): Promise<void>;
