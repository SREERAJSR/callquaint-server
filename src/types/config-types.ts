export  interface configTypes{
    PORT: string,
    ORIGIN: string,
    MONGO_URL: string,
    DB_NAME: string,
    BASE_URL: string,
    HOST: string,
    SERVICE: string,
    MAIL: string,
    PASS: string,
    EXPRESS_SESSION_SECRET: string,
    ACCESS_TOKEN_SECRET:string,
    ACCESS_TOKEN_EXPIRY: string,
    REFRESH_TOKEN_SECRET: string,
    REFRESH_TOKEN_EXPIRY: string,
    NODE_ENV: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CALLBACK_URL: string,
    CLIENT_SSO_REDIRECT_URL: string,
    GITHUB_CLIENT_SECRET: string,
    GITHUB_CLIENT_ID: string,
    GITHUB_CALLBACK_URL: string,
    RAZOR_PAY_KEY_ID: string,
    RAZOR_PAY_SECRET_KEY:string
    
}

export type corsOptionsType = { origin:string }