"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const PORT = (0, config_1.default)().PORT || 3000;
const serverConfig = (app) => {
    app.listen(PORT, () => {
        console.log(`SERVER IS CONNECTED ${PORT}`);
    });
};
exports.default = serverConfig;
