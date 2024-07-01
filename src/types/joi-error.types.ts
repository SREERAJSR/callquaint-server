export interface ValidationError{
    message: string,
    type:string
}

export interface JoiError {
    status: string,
    error: {
        original?: unknown,
        details:ValidationError[]
    }
}
export interface CustomError {
  status: string;
  error: string;
}

