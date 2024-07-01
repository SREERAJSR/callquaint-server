class ApiResponse {
    statusCode: number
    data: unknown
    message: string
    succces:boolean
    constructor(statusCode: number, data: unknown, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.succces = statusCode < 400
    }

}

export default ApiResponse;