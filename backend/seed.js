require("dotenv").config();
const mongoose = require("mongoose");
const config = require("./config");

const User = require("./models/User");





async function connectDB() {
	try {
		await mongoose.connect(config.dbURL);
		console.log("Connected to DB in development environment");
		await init();
	} catch (err) {
		console.error("Database connection error:", err);
		process.exit(1);
	}
}

const seedUser = async () => {
	try {
		const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
		if (existingAdmin) {
			console.log("Super admin already exists");
			return;
		}


		const password = "admin";

		const user = new User({
		
			email: "admin@gmail.com",
			password: "admin",
			role: "admin",
			firstName: "admin",
			lastName: "admin",
			isVerified: true,
			isActive: true,
			accountStatus: 3,
			
		});

		const hashPassword = user.generatePassword(password);
		user.password = hashPassword;  

		await user.save();
		console.log("Super admin created successfully");
		return user;
	} catch (err) {
		console.error("Error creating super admin:", err);
	}
};

// seed referral user
const seedReferralUser = async () => {
	try {
		const existingReferralUser = await User.findOne({ email: "referral@gmail.com" });
		if (existingReferralUser) {
			console.log("Referral user already exists");
			return;
		}
		const password = "1234";
		const referralUser = new User({
			email: "referral@gmail.com",
			password: "1234",
			role: "referral",
			firstName: "referral",
			lastName: "referral",
			accountStatus: 1,
			isVerified: true,
			isActive: true,
		});
		const hashPassword = referralUser.generatePassword(password);
		referralUser.password = hashPassword;
		await referralUser.save();
		console.log("Referral user created successfully");
		return referralUser;
	} catch (err) {
		console.error("Error creating referral user:", err);
	}
};

async function init() {
	try {
		console.log("Initializing database");
		// Uncomment if you want to drop the database
		await mongoose.connection.db.dropDatabase();

		await seedUser();
		await seedReferralUser();
		exit();
	} catch (err) {
		console.error("Initialization error:", err);
		exit();
	}
}

function exit() {
	console.log("Exiting");
	process.exit(0); // Use 0 for successful exit, 1 for error
}

connectDB();
