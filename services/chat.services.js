"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLocalFile = void 0;
const fs_1 = __importDefault(require("fs"));
const removeLocalFile = (localPath) => {
    fs_1.default.unlink(localPath, (err) => {
        if (err)
            console.log("Error while removing local files: ", err);
        else {
            console.log("Removed local: ", localPath);
        }
    });
};
exports.removeLocalFile = removeLocalFile;
