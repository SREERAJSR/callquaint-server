"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const configkeys_1 = __importDefault(require("./configkeys"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const corsOptions = { origin: (0, configkeys_1.default)().ORIGIN };
const expressConfig = (app) => {
    app.use((0, cors_1.default)(corsOptions)),
        app.use((0, morgan_1.default)('dev')),
        app.use((0, cookie_parser_1.default)()),
        app.use(express_1.default.json()),
        app.use(express_1.default.urlencoded({ extended: true })),
        app.use((0, express_session_1.default)({
            secret: (0, configkeys_1.default)().EXPRESS_SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        })),
        app.use(passport_1.default.initialize()),
        app.use(passport_1.default.session()),
        app.use(express_1.default.static("public"));
};
exports.default = expressConfig;
