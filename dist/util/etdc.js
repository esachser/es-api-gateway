"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const etcd3_1 = require("etcd3");
const config_1 = require("./config");
const ETCD_CLIENT = new etcd3_1.Etcd3(config_1.configuration.etcdConf);
exports.default = ETCD_CLIENT;
//# sourceMappingURL=etdc.js.map