"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configkeys_1 = __importDefault(require("./configkeys"));
const PORT = (0, configkeys_1.default)().PORT || 3000;
const serverConfig = (httpserver) => {
    httpserver.listen(PORT, () => {
        console.log(`SERVER IS CONNECTED ${PORT}`);
    });
};
exports.default = serverConfig;
