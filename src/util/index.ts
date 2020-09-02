import path from 'path';
import fsasync from 'fs/promises';
import YAML from 'yaml';

export const baseDirectory =  path.resolve('.');

export async function readFileToObject(fname: string) {
    const fileContents = (await fsasync.readFile(fname)).toString();
    const ext = path.extname(fname);

    if (ext === '.json') {
        return JSON.parse(fileContents);
    }
    else if (ext === '.yaml') {
        return YAML.parse(fileContents);
    }
}

export function delay(ms: number): Promise<NodeJS.Timeout> {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
