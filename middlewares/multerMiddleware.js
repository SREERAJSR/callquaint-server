"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        var _a;
        let fileExtension = "";
        if (file.originalname.split(".").length > 1) {
            fileExtension = file.originalname.substring(file.originalname.lastIndexOf('.'));
        }
        const filenameWithoutExtension = (_a = file.originalname.toLowerCase().split(' ').join('-')) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        cb(null, filenameWithoutExtension + Date.now()
            + Math.ceil(Math.random() * 1e5)
            + fileExtension);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1 * 1000 * 1000
    }
});
