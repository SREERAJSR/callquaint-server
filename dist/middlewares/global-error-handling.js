"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandling = (err, req, res, next) => {
    var _a;
    console.log(err);
    err.statusCode = (_a = err.statusCode) !== null && _a !== void 0 ? _a : 500;
    res.status(err.statusCode).json({
        errorMessage: err.message,
        success: false,
    });
};
exports.default = errorHandling;
