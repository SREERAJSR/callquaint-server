import { NextFunction, Request, RequestHandler, Response } from "express";
import { CustomError, JoiError, ValidationError } from "../../types/joi-error.types";
import { ObjectSchema, valid } from "joi";
import HttpStatus from "../../types/constants/http-statuscodes";
import {
    authLoginSchema, authSignupSchema,
    forgotPasswordSchema, verifyRouteSchema,
    resetPasswordTokenSchema,
    resetPasswordBodySchema,
    mongoIdPathVariableValidatorSchemaFn
} from "../schemas/joi.schema";
import { validateItems } from "../../types/constants/validateItems";
// enum supportedMethods { "post", "put", "patch", "delete" }
const supportedMethods:string[]= ["get", "post", "put", "patch", "delete" ]


const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false,
};


const validate = (useJoiError: boolean, validateItem: string, schema: ObjectSchema): RequestHandler => {

    return (req: Request, res: Response, next: NextFunction) => {
        let operation;
        if (validateItem === "REQUEST_BODY") operation = req.body;
        else if (validateItem === "ROUTE_PARAMS") operation = req.params;
        else if (validateItem === "QUERY_STRING") operation = req.query;
        const method = req.method.toLowerCase()
        if (!supportedMethods.includes(method)) return next()
         const { error, value } = schema.validate(operation, validationOptions);
       
        if (error) {
            const customError: CustomError = {
                status: "failed",
                error: "Invalid request. Please review request and try again."
            }
            const joiError: JoiError = {
                status: 'failed',
                error: {
                     original: error?._original,
                    details: error?.details.map(({ message, type }: ValidationError) => ({
                        message: message.replace(/['"]/g, ""),
                        type: type
                    })) as ValidationError[]
                }
            }
            return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(useJoiError ? joiError : customError);
        }
         if ( validateItem=== "REQUEST_BODY") req.body = value;
         else if (validateItem ==="ROUTE_PARAMS") req.params = value
         else if (validateItem=== "QUERY_STRING")  req.query = value
        return next();
    };
}



export const mongoIdPathVariableValidator = (validateItems: string, pathName: string): RequestHandler => {
    return validate(true,validateItems,mongoIdPathVariableValidatorSchemaFn(pathName))
}