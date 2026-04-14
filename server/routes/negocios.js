const express = require("express");
const router = express.Router();
const { createNegocio } = require("../controllers/negocioController");

router.post("/", createNegocio);

module.exports = router;
