  const express=require("express");
  const router=express.Router();
  const wrapAsync=require("../utils/wrapAsync.js");
  const Listing=require("../models/listing.js");
  const{isLoggedIn, isOWner,validateListing, isreviewAuthor}=require("../middleware.js");
  const { index, addListing, showListing, createListing, editListing, updateListing, destroyListing } = require("../controllers/listings.js");
  const listingController=require("../controllers/listings.js");
  const multer  = require('multer')
  const {storage}=require("../cloudConfig.js");
  const upload = multer({ storage });

  const {searchHandler}=require("../controllers/listings.js");



  router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
  isLoggedIn,
  upload.single('image'),
  validateListing,
  wrapAsync(listingController.createListing)
);

 //new route-add new listing
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.get('/search',searchHandler);


router
.route("/:id")
.get(validateListing,wrapAsync(listingController.showListing))
.put(
  isLoggedIn,
  isOWner,
  upload.single('image'),
  validateListing,
  wrapAsync(listingController.updateListing))
  .delete(isLoggedIn,
      isOWner,
      wrapAsync(listingController.destroyListing));
  
    //edit route
router.get("/:id/edit",isLoggedIn,
  isOWner,
  wrapAsync(listingController.editListing));

    module.exports=router;