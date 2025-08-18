require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const fs = require("fs");
const path = require("path");

// Connect to MongoDB using env variable
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const products = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./productsSeedWithCategories.json"), "utf-8")
);

async function seed() {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("Products seeded successfully!");
  } catch (err) {
    console.error("Error seeding products:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed();