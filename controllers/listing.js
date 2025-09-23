const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
  const { title } = req.query;
  let allListings;

  if (title) {
    allListings = await Listing.find({
      title: { $regex: new RegExp(title, "i") }
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, title });
};

module.exports.newrenderform = (req,res) => {
        res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", 
    populate: 
        { path: "author"},
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you are requested is not available");
        return res.redirect("/listings");
    };
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
   let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
    })
  .send()  

    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url, filename};

    newlisting.geometry  = response.body.features[0].geometry;

    let savedListing = await newlisting.save();
    console.log(savedListing);
    req.flash("success", "New listing created");
    res.redirect("/listings");
   
};

// async function updateOldListings() {
//     const listings = await Listing.find({ 'geometry.coordinates': { $size: 0 } });

//     for (let listing of listings) {
//         if (!listing.location) continue;

//         try {
//             const response = await geocodingClient.forwardGeocode({
//                 query: listing.location,
//                 limit: 1
//             }).send();

//             if (response.body.features.length > 0) {
//                 listing.geometry = response.body.features[0].geometry;
//                 await listing.save();
//                 console.log(`Updated: ${listing.title}`);
//             } else {
//                 console.log(`Could not geocode: ${listing.title}`);
//             }
//         } catch (err) {
//             console.error(`Error updating ${listing.title}:`, err);
//         }
//     }

//     console.log('Done updating old listings!');
// }

// updateOldListings();



module.exports.renderEditForm = async (req, res) => {
     let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you are requested is not available");
        return res.redirect("/listings");
    };
    let originalImage =listing.image.url;
    originalImage = originalImage.replace("/upload", "/upload/h_300,w_200");
    res.render("listings/edit.ejs", {listing, originalImage});
};

module.exports.updateListing = async(req, res) =>{
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

        if(typeof req.file !== "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
            await listing.save();
        }
        req.flash("success", "Listing updated");
        res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
};