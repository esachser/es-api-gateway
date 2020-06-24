"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EsJsonFrom = {
    transformAnyToBuffer(input, opts) {
        return Promise.resolve(Buffer.from(JSON.stringify(input)));
    }
};
exports.default = EsJsonFrom;
//# sourceMappingURL=from.js.map