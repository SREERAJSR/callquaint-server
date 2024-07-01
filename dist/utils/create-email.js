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
const nodemailer_1 = __importDefault(require("nodemailer"));
const configkeys_1 = __importDefault(require("../configs/configkeys"));
const AppError_1 = __importDefault(require("./AppError"));
const http_statuscodes_1 = __importDefault(require("../types/constants/http-statuscodes"));
const sendEmail = (email, subject, url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: (0, configkeys_1.default)().HOST,
            service: (0, configkeys_1.default)().SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: (0, configkeys_1.default)().MAIL,
                pass: (0, configkeys_1.default)().PASS
            }
        });
        yield transporter.sendMail({
            from: (0, configkeys_1.default)().MAIL,
            to: email,
            subject: subject,
            text: url,
            html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Awesome Email</title>
</head>
<body>
    <h1>Hello User!!! This is from callquaint</h1>
<a href="${url}">
  <button>Click here to verify</button>
</a>
<p>Thank you for reading!</p>
</body>
</html>`
        });
        console.log('email send successfully');
    }
    catch (error) {
        console.log('email send failed');
        throw new AppError_1.default('email send failed', http_statuscodes_1.default.INTERNAL_SERVER_ERROR);
    }
});
exports.default = sendEmail;
