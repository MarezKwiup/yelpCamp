const express=require("express");
const router=express.Router({mergeParams:true});
const Review = require("../models/review.js");
const catchAsync=require("../utils/catchAsync");
const ExpressError=require("../utils/ExpressError");
const Campground = require('../models/campground');
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware");
const reviews = require("../controllers/reviews");


router.post("/",isLoggedIn, validateReview, catchAsync(reviews.createReviews));

router.delete("/:reviewId" ,isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports=router;