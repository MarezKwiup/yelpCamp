//auth routes
const express=require("express");
const passport = require("passport");
const router=express.Router();
const User=require("../models/user");
const catchAsync=require("../utils/catchAsync");
const users=require("../controllers/users")

router.get("/register",users.renderRegister); 

//registering using
router.post("/register",catchAsync(users.register));

//Login
router.get("/login",users.renderLogin);

router.post("/login", passport.authenticate("local",{failureFlash:true , failureRedirect:"/login"}),users.login);

//Logout
router.get("/logout", users.logout);

//If i am not able to logout


module.exports=router;