if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');;
const path = require('path');
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
//const { REFUSED } = require('dns');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const dbUrl = process.env.ATLASDB_URL;

main().then( () => {
    console.log("connected successfully");
}).catch((err) => {
    console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        SECRET: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("Session store error",err);
})

const sessionoptions = {
    store,
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        expires : Date.now() + 7* 24 *60 *60*1000,
        maxAge : 7* 24 *60 *60*1000,
        httpOnly : true,
    }
}

// app.get("/", (req, res) => {
//     res.send("hello world");
// });



app.use(session(sessionoptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("Error.ejs",{message});
    // res.status(statusCode).send(message);
});







// const Listing = require("./models/listing");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// require("dotenv").config();

// const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// async function fixOldListings() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust"); // change DB name if needed

//   const listings = await Listing.find({});
//   for (let listing of listings) {
//     if (!listing.geometry || !listing.geometry.coordinates.length) {
//       let response = await geocodingClient.forwardGeocode({
//         query: listing.location,
//         limit: 1,
//       }).send();

//       if (response.body.features.length) {
//         listing.geometry = response.body.features[0].geometry;
//         await listing.save();
//         console.log(`✅ Updated: ${listing.title}`);
//       } else {
//         console.log(`⚠️ Could not find coordinates for: ${listing.title}`);
//       }
//     }
//   }

//   mongoose.connection.close();
// }

// fixOldListings();








app.listen(8080, () => {
    console.log("server is listening");
});
