const Listing = require("../models/listing");
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
const DEFAULT_FILENAME = "";
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const category = req.query.category || null;
  const filter = category
    ? { category: new RegExp(`^${category}$`, "i") } // case-insensitive exact match
    : {};
  const allListings = await Listing.find(filter);

  res.render("listings/index", { allListings, category });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  // console.log("Listing ID:", id);
  const listing = await Listing.findById(id)
    .populate({
      path: "review",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing that you are requested for doesn't exist");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // 1. Geocoding
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // 2. Data Validation
  if (!req.body.listing) {
    throw new ExpressError(400, "send valid data for listing");
  }

  // 3. Create Listing Instance
  const newListing = new Listing(req.body.listing);

  // 4. Set Owner, Image, and Geometry
  newListing.owner = req.user._id;
  newListing.image = { url: req.file.path, filename: req.file.filename };
  newListing.geometry = response.body.features[0].geometry;

  // 5. Save and Redirect
  let savedListing = await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing that you are requested for doesn't exist");
    return res.redirect("/listings");
  } else {
    req.flash("success", "Changes done");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "send valid data for listing");
  }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Deletd listing successfully!");
  res.redirect("/listings");
};

module.exports.searchHandler = async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.redirect("/listings");
  }
  try {
    const listings = await Listing.find({
      $or: [
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { title: { $regex: query, $options: "i" } },
      ],
    });
    // Render your listings index template, passing filtered listings
    res.render("listings/search.ejs", { listings, query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
