const cors = require("cors");
const express = require("express");
const config = require("./config");
const mongoose = require("mongoose");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
// passport config
require("./utils/passport");
const { allowedOrigins, dbURL } = config;

module.exports = (app) => {
    // app.use(
    //     cors({
	// 		credentials: true,
	// 		origin: (origin, callback) => {
	// 			if (!origin) return callback(null, true);
            
	// 			if (allowedOrigins.indexOf(origin) === -1) {
	// 				const msg = "The CORS policy for this site does not allow access from the specified Origin.";
	// 				return callback(new Error(msg), false);
	// 			}
	// 			return callback(null, true);
	// 		},
	// 	})
    // )
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // Set to true in production with HTTPS
      }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Add this line to serve static files from public directory
    app.use("/uploads", express.static("public/uploads"));

    const connectToDatabase = async () => {
        try {
            await mongoose.connect(dbURL);
            console.log("Connected to database");
        } catch (error) {
            console.log("Error connecting to database", error);
            process.exit(1);
        }
    }
    connectToDatabase();

    app.use("/", routes);

    const errorHandler = (err, req, res, next) => {
        res.status(err.status || 500)
        res.json({
            errors: {
                message: err.message,
            },
        })
    }
    app.use(errorHandler);
}