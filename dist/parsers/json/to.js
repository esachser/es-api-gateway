"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EsJsonTo = {
    transformBufferToAny(input, opts) {
        var _a;
        const encoding = (_a = opts === null || opts === void 0 ? void 0 : opts.encoding) !== null && _a !== void 0 ? _a : 'utf8';
        return Promise.resolve(JSON.parse(input.toString(encoding)));
    }
};
exports.default = EsJsonTo;
//# sourceMappingURL=to.js.map