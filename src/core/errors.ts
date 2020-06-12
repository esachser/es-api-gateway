

export class ApiCreationError extends Error {
    constructor(api:string, message: string) {
        super(message);
    }
};