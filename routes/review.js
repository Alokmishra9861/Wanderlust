    const express=require("express");
    const router=express.Router({mergeParams:true});
    const wrapAsync=require("../utils/wrapAsync.js");
    const ExpressError=require("../utils/ExpressError.js");
    const Review=require("../models/reviews.js");
    const Listing=require("../models/listing.js"); 
    let {validateReview, isLoggedIn, isreviewAuthor}=require("../middleware.js");  
    const { createReview } = require("../controllers/reviews.js");

    const reviewController=require("../controllers/reviews.js");
    //post reviews route
   router.post("/",
        isLoggedIn,
        validateReview,
        wrapAsync(reviewController.createReview));

     //delete review route
    router.delete("/:reviewId",
        isLoggedIn,
        isreviewAuthor,
        wrapAsync(reviewController.destroyReview));

        module.exports=router;
