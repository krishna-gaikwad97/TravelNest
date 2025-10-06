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
const session =require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStratergy=require("passport-local");
const user=require("./models/user.js");

const sessionOption={
  secret:"mysupersecret",
  resave:false,
  saveUninitialized:true,
  Cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
};
app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  //console.log(res.locals.success);
  next();
});

const listingrouter=require("./routes/listing.js");
const reviewrouter=require("./routes/review.js");
const userrouter=require("./routes/user.js");
const router = require("./routes/listing.js");

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
// app.get("/demouser",async(req,res)=>{
//   let fakeuser=new user({
//     email:"Student@gmail.com",
//     username:"delta-student"
//   });
//   let registeruser=await user.register(fakeuser,"helloworld");
//   res.send(registeruser);

// })
app.use("/listings",listingrouter);
app.use("/listings/:id/reviews",reviewrouter);
app.use("/",userrouter);


app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong" } = err;
  res.status(status).send(message);
});


app.listen(8080, () => {
  console.log("server is listening to port 8080");
});