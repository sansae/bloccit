const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const validation = require("./validation");

router.get("/users/sign_up", userController.signUpForm);

router.post("/users", validation.validateUsers, userController.create);

router.get("/users/sign_in", userController.signInForm);

router.post("/users/sign_in", userController.signIn);

router.get("/users/sign_out", userController.signOut);

router.get("/users/:id", userController.show);

module.exports = router;
