import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import configKey from './configkeys';
import { Application } from 'express';
import { corsOptionsType } from '../types/config-types';
import session from 'express-session'; 
import passport from 'passport';
  
         
  
const corsOptions:corsOptionsType = { origin: configKey().ORIGIN};
 
const expressConfig = (app: Application) => {
 
       app.use(cors(corsOptions)),
        app.use(morgan('dev')),
        app.use(cookieParser()), 
        app.use(express.json()),
        app.use(express.urlencoded({ extended: true })),
          app.use(session({
             secret: configKey().EXPRESS_SESSION_SECRET,
             resave: false,
           saveUninitialized:false
        })),
   app.use(passport.initialize()),
          app.use(passport.session()),
          app.use(express.static("public"));
}
   
export default expressConfig;