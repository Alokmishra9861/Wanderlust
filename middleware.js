const Listing=require("./models/listing");
const Review=require("./models/reviews");
const ExpressError=require("./utils/ExpressError.js");
const { listingSchema,reviewSchema}=require("./schema.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in first to create listing!");
        return res.redirect("/login");
    }
    next();
}

//passport automatically make the session->redirectUrl clear after the login so we save the val to locals
module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){//if there is any redirect url in the session save it to locals
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};


module.exports.isOWner=async(req,res,next)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","you are not the owner of the listing")
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing=(req,res,next)=>{
           let {error}=listingSchema.validate(req.body);
           if(error){
               let errMsg=error.details.map((el)=>el.message).join(",");
               throw new ExpressError(400,errMsg);
           }else{
               next();
           }
       };

 module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
    next();
    }
};

module.exports.isreviewAuthor=async(req,res,next)=>{
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of the review")
        return res.redirect(`/listings/${id}`);
    }
    next();
}