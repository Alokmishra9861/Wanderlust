const mongoose = require("mongoose");
const Listing = require("../models/listing"); // adjust path if needed

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function updateAllCategories() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const listings = await Listing.find({}); // get all listings

    for (let listing of listings) {
      // Your custom logic here:
      const loc = listing.location ? listing.location.toLowerCase() : "";
      const price = listing.price || 0;

      if (loc.includes("beach")) {
        listing.category = "beach";
      } else if (loc.includes("city")) {
        listing.category = "iconic cities";
      } else if (loc.includes("castle")) {
        listing.category = "castle";
      } else if (price > 200) {
        listing.category = "amazing pools";
      } else {
        listing.category = "trending"; // default category
      }

      // Ensure geometry is set properly
      if (!listing.geometry || !listing.geometry.type) {
        listing.geometry = {
          type: "Point",
          coordinates: [0, 0], // default coordinates, update as needed
        };
      }

      await listing.save();
      console.log(`Updated listing ${listing._id} with category: ${listing.category}`);
    }

    console.log("All listings updated.");
    process.exit(0);
  } catch (err) {
    console.error("Error updating listings:", err);
    process.exit(1);
  }
}

updateAllCategories();
