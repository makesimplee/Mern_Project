const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");


const authRouter = express.Router();
/**
 * @route POST /api/auth/register
 * @description register a new user
 * @access public
 */
authRouter.post("/register",authController.registerUserController);


/**
 * @route POST api/auth/login
 * @description login user
 * @access public
 */
authRouter.post("/login",authController.loginUserController);


/**
 * @route GET
 * @discription llogout user, clear cookies fron client sidew and add in blacklist
 * @access private
 */
authRouter.get("/logout",authController.logoutUserController);


/**
 * @route GET api/auth/get-me
 * @discription get details of current logged in user\
 * @access private
 */
authRouter.get("/get-me",authMiddleware.authUser,authController.getMeController);

module.exports = authRouter
