
const config = {
    port: process.env.PORT,
    dbURL: process.env.DB_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRES_IN,
    sessionSecret: process.env.SESSION_SECRET,
    publicPics: process.env.PUBLIC_PICS,

   // set to all for now, we'll change this later
    allowedOrigins: [process.env.FRONTEND_URL, "http://13.56.163.46", "http://localhost:3000"],



    // FRONTEND URL TEMP
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    SMTPAuth: {
        Email: process.env.SMTP_USERNAME,
        Password: process.env.SMTP_PASSWORD,
        Host: process.env.SMTP_HOST,
        Port: process.env.SMTP_PORT,
     
    }
}


console.log("process.env.FRONTEND_URL", process.env.FRONTEND_URL)


module.exports = config;