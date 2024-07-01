    class AppError extends Error {

        statusCode: number
        errormessage: string;
        constructor( message: string, statusCode: number) {
            super(message)
            this.statusCode = statusCode;
            this.errormessage = message;
            Error.captureStackTrace(this,this.constructor)
        } 

    };

export default AppError 