import serverConfig from "./configs/server.config";
import express,{Application, NextFunction} from "express";
import expressConfig from "./configs/express.config";
import databaseConfg from "./configs/db.config";
import routesConfig from "./routes/routes";
import errorHandling from "./middlewares/global-error-handling";
import AppError from "./utils/AppError";
import asynchHandler from 'express-async-handler';
import "./utils/cron";
import   './passport/index'
import { Server } from "socket.io";
import { createServer } from 'http';
import configKey from "./configs/configkeys";
import { initializeIo } from "./configs/socket.io";

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: configKey().ORIGIN,
        credentials: true
    }
})
app.set('io', io);

// database config
databaseConfg()  

//express config 
expressConfig(app);

//server config 
serverConfig(httpServer)

//routes config
routesConfig(app)

//initialize socet.io 
initializeIo(io)



app.use(errorHandling) 

 
app.all('*', asynchHandler(async(req,res,next:NextFunction) => {
    next(new AppError('Not found', 404));
}));


 