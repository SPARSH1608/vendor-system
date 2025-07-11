const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Product = require("../models/Product")
const Location = require("../models/Location")
require("dotenv").config()

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vendor-management")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Product.deleteMany({})
    await Location.deleteMany({})
    console.log("Cleared existing data")

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12)
    const admin = await User.create({
      email: "admin@example.com",
      password: adminPassword,
      phone: "+919876543210",
      role: "admin",
    })
    console.log("Admin user created")

    // Create sample vendors
    const vendorPassword = await bcrypt.hash("vendor123", 12)
    const vendors = await User.create([
      {
        email: "vendor1@example.com",
        password: vendorPassword,
        phone: "+919876543211",
        role: "vendor",
      },
      {
        email: "vendor2@example.com",
        password: vendorPassword,
        phone: "+919876543212",
        role: "vendor",
      },
      {
        email: "vendor3@example.com",
        password: vendorPassword,
        phone: "+919876543213",
        role: "vendor",
      },
    ])
    console.log("Vendor users created")

    // Create sample regular users
    const userPassword = await bcrypt.hash("user123", 12)
    const users = await User.create([
      {
        email: "user1@example.com",
        password: userPassword,
        phone: "+919876543214",
        role: "user",
      },
      {
        email: "user2@example.com",
        password: userPassword,
        phone: "+919876543215",
        role: "user",
        isActive: false,
      },
    ])
    console.log("Regular users created")

    // Create sample products
    const products = await Product.create([
      {
        name: "Basmati Rice",
        description: "Premium quality basmati rice",
        price: 120,
        category: "pulses",
        stock_unit: "kg",
        created_by: admin._id,
      },
      {
        name: "Fresh Tomatoes",
        description: "Organic fresh tomatoes",
        price: 40,
        category: "vegetables",
        stock_unit: "kg",
        created_by: admin._id,
      },
      {
        name: "Bananas",
        description: "Fresh yellow bananas",
        price: 60,
        category: "fruits",
        stock_unit: "kg",
        created_by: admin._id,
      },
      {
        name: "Whole Milk",
        description: "Fresh whole milk",
        price: 25,
        category: "dairy",
        stock_unit: "litre",
        isActive: false,
        created_by: admin._id,
      },
      {
        name: "Turmeric Powder",
        description: "Pure turmeric powder",
        price: 80,
        category: "masala",
        stock_unit: "kg",
        created_by: admin._id,
      },
      {
        name: "Almonds",
        description: "Premium quality almonds",
        price: 800,
        category: "dry fruits",
        stock_unit: "kg",
        created_by: admin._id,
      },
    ])
    console.log("Products created")

    // Create sample locations
    const locations = await Location.create([
      {
        name: "Delhi",
        code: "DEL",
        coordinates: {
          latitude: 28.6139,
          longitude: 77.209,
        },
      },
      {
        name: "Mumbai",
        code: "MUM",
        coordinates: {
          latitude: 19.076,
          longitude: 72.8777,
        },
      },
      {
        name: "Bangalore",
        code: "BLR",
        coordinates: {
          latitude: 12.9716,
          longitude: 77.5946,
        },
      },
      {
        name: "Chennai",
        code: "CHE",
        coordinates: {
          latitude: 13.0827,
          longitude: 80.2707,
        },
      },
      {
        name: "Kolkata",
        code: "KOL",
        coordinates: {
          latitude: 22.5726,
          longitude: 88.3639,
        },
      },
    ])
    console.log("Locations created")

    console.log("\n=== SEED DATA SUMMARY ===")
    console.log(`Admin: admin@example.com / admin123`)
    console.log(`Vendors: vendor1@example.com, vendor2@example.com, vendor3@example.com / vendor123`)
    console.log(`Users: user1@example.com, user2@example.com / user123`)
    console.log(`Products: ${products.length} created`)
    console.log(`Locations: ${locations.length} created`)
    console.log("========================\n")

    process.exit(0)
  } catch (error) {
    console.error("Seed data error:", error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
}

module.exports = seedData
