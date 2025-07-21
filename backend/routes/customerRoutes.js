const express = require("express");

const auth = require("../middleware/auth");
const { getCustomerByPhone } = require("../controllers/customerController");

const router = express.Router();

// @desc Get customer by phone number
// @route GET /api/customers/:phone
// @access Private
router.get("/:phone", getCustomerByPhone);

module.exports = router;