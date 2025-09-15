const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()
const events = require('events');
events.defaultMaxListeners = 20; // Set the limit to 20 (or any desired number)

// Import routes
// Import routes
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const qrRoutes = require("./routes/qrRoutes")
const locationRoutes = require("./routes/locationRoutes")
const vendorProductRoutes = require("./routes/vendorProductRoutes")
const billRoutes = require("./routes/billRoutes")
const customerRoutes = require("./routes/customerRoutes")
const reportRoutes = require("./routes/reportRoutes");
// const superAdminRoutes = require("./routes/superAdmin")
// Import middleware
const errorHandler = require("./middleware/errorHandler")
const { connectDB } = require("./config/db")
const path = require("path")

const app = express()

// Security middleware
// app.use(helmet())
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173", // Vite default port
      "http://localhost:4173", // Vite preview port
      "https://app.sristikheduthaat.com",
      "https://vendor-virid.vercel.app",
    ],
    credentials: true,
  }),
)

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// })
// app.use("/api/", limiter)

// Logging
// app.use(morgan("combined"))

// Body parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/vendors", vendorRoutes)
app.use("/api/invoices", invoiceRoutes)
// app.use("/api/qr", qrRoutes)
// app.use("/api/locations", locationRoutes)
app.use("/api/vendors", vendorProductRoutes)
app.use("/api", billRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/report", reportRoutes);
// app.use("/api/super-admin", superAdminRoutes)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Vendor Management API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
// app.use(errorHandler)

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//   })
// })

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
