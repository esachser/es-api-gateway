import forge from 'node-forge';
import fsasync from 'fs/promises';
import path from 'path';
import { baseDirectory } from '.';
import { configuration } from './config';
import Keyv from 'keyv';

const cacheFiles = new Keyv({
    ttl: 60 * 60 * 1000,
});

export async function getPublicCert(api: string, certName: string) {
    const fname = path.resolve(baseDirectory, 'resources', configuration.env, api, certName);
    const fcontents = await cacheFiles.get(fname);
    if (fcontents !== undefined) {
        return fcontents;
    }
    const fileContents = await fsasync.readFile(fname, 'binary');
    cacheFiles.set(fname, fileContents);
    return fileContents;
}

export async function getPrivateKey(api: string, certName: string, certPass?: string) {
    const fname = path.resolve(baseDirectory, 'resources', configuration.env, api, certName);
    const fcontents = await cacheFiles.get(`${certPass}::/::${fname}`);
    if (fcontents !== undefined) {
        return fcontents;
    }
    const fileContents = await fsasync.readFile(fname, 'binary');
    const privateKey = forge.pki.decryptRsaPrivateKey(fileContents, certPass);
    const pkStr = forge.pki.privateKeyToPem(privateKey);
    cacheFiles.set(`${certPass}::/::${fname}`, pkStr);
    return pkStr;
}