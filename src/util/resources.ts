import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { baseDirectory } from '.';
import { configuration } from './config';

const access = promisify(fs.access);
const stat = promisify(fs.stat);

const baseResourcesPath = path.resolve(baseDirectory, 'resources');

export async function getResourceFileStream(filename: string, api?: string) {
    filename = filename.replace(new RegExp(`\\.\\.\\${path.sep}`, 'g'), '');
    const resourceAbsFile = 
        api !== undefined ?
        path.resolve(baseResourcesPath, configuration.env, api, filename) : 
        path.resolve(baseResourcesPath, configuration.env, filename);

    await access(resourceAbsFile, fs.constants.R_OK);
    // Nesse ponto não estourou exceção, então temos acesso ao arquivo
    return fs.createReadStream(resourceAbsFile);
}

export async function getResourceStat(filename: string, api?: string) {
    filename = filename.replace(new RegExp(`\\.\\.\\${path.sep}`, 'g'), '');
    const resourceAbsFile = 
        api !== undefined ?
        path.resolve(baseResourcesPath, configuration.env, api, filename) : 
        path.resolve(baseResourcesPath, configuration.env, filename);

    await access(resourceAbsFile, fs.constants.R_OK);
    // Nesse ponto não estourou exceção, então temos acesso ao arquivo
    return stat(resourceAbsFile);
}

