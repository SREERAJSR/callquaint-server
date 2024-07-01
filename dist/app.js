"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_config_1 = __importDefault(require("./configs/server.config"));
const express_1 = __importDefault(require("express"));
const express_config_1 = __importDefault(require("./configs/express.config"));
const db_config_1 = __importDefault(require("./configs/db.config"));
const routes_1 = __importDefault(require("./routes/routes"));
const global_error_handling_1 = __importDefault(require("./middlewares/global-error-handling"));
const AppError_1 = __importDefault(require("./utils/AppError"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
require("./utils/cron");
require("./passport/index");
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const configkeys_1 = __importDefault(require("./configs/configkeys"));
const socket_io_2 = require("./configs/socket.io");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: (0, configkeys_1.default)().ORIGIN,
        credentials: true
    }
});
app.set('io', io);
// database config
(0, db_config_1.default)();
//express config 
(0, express_config_1.default)(app);
//server config 
(0, server_config_1.default)(httpServer);
//routes config
(0, routes_1.default)(app);
//initialize socet.io 
(0, socket_io_2.initializeIo)(io);
app.use(global_error_handling_1.default);
app.all('*', (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    next(new AppError_1.default('Not found', 404));
})));
