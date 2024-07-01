import { Application } from "express";
import configKey from "./configkeys";
import { Server as HttpServer } from 'http';

const PORT = configKey().PORT || 3000;

const serverConfig =  (httpserver:HttpServer) => {
    httpserver.listen(PORT,() => {
        console.log(`SERVER IS CONNECTED ${PORT}`);
    })  
    
} 
 
export default serverConfig;  