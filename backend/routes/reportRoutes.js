const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/vendor-sales", reportController.vendorSales);
router.get("/product-sales-by-place", reportController.productSalesByPlace);
router.get("/vendor-specific-sales", reportController.vendorSpecificSales); // <-- Add this

module.exports = router;