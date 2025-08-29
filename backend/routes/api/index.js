const express = require("express");
const authRoutes = require("./auth");
const matchesRoutes = require("./match");
const favoritesRoutes = require("./favorite");
const usersRoutes = require("./users");

const userRoutes = require("./user");




const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

router.use("/user", userRoutes);


router.use("/favorites", favoritesRoutes);
router.use("/match", matchesRoutes);


module.exports = router;
