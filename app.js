const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const engine=require("ejs-mate");
app.use(express.static(path.join(__dirname, "public")));
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}
app.engine("ejs",engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings",wrapAsync( async (req, res,next) => {
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }
    const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");

 
  
}));

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  if(!req.body.listing){
    throw new ExpressError(400,"send valid data for listing");
  }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});
//reviews
app.post("/listings/:id/reviews", async (req, res) => {
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.Review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("new review added");
  res.redirect(`/listings/${listing._id}`);

});

//delete review
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async (req, res) => {
//   let { id, reviewId } = req.params;
//   const reviewIdTrimmed = reviewId.trim();
//   await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//   await Review.findByIdAndDelete(reviewIdTrimmed);
//   res.redirect(`/listings/${id}`);
// }));


app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;

  // Remove any extra whitespace
  const reviewIdTrimmed = reviewId.trim();

  await Listing.findByIdAndUpdate(
    id,
    { $pull: { reviews: mongoose.Types.ObjectId(reviewIdTrimmed) } }
  );
  await Review.findByIdAndDelete(reviewIdTrimmed);

  res.redirect(`/listings/${id}`);
}));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});