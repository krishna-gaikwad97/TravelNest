const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
});

//Create Route
router.post("/",wrapAsync( async (req, res,next) => {
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success","New listing Created");
  res.redirect("/listings");

 
  
}));

//Edit Route
router.get("/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
router.put("/:id", async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success","Updated Succesfully");
  res.redirect(`/listings/${id}`);
});

//Delete Route
router.delete("/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success","listing deleted");
  res.redirect("/listings");
});

module.exports=router;