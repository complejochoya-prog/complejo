const express = require("express");
const router = express.Router();
const { updatePlan } = require("../controllers/subscriptionController");

router.put("/:id", updatePlan);

module.exports = router;
