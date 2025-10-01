const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const mongoose = require("mongoose");


//reviews
router.post("/", async (req, res) => {
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
   req.flash("success","New Review created");
  console.log("new review added");
  res.redirect(`/listings/${listing._id}`);

});

router.delete("/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  const reviewIdTrimmed = reviewId.trim();

  await Listing.findByIdAndUpdate(
    id,
    { $pull: { reviews: new mongoose.Types.ObjectId(reviewIdTrimmed) } }
  );

  await Review.findByIdAndDelete(reviewIdTrimmed);
req.flash("success"," Review deleted");
  res.redirect(`/listings/${id}`);
}));

module.exports=router;