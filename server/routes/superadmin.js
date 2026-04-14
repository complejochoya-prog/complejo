const express = require("express");
const router = express.Router();
const { getNegocios, toggleNegocio, createNegocio, updateNegocio } = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");
const isSuperAdmin = require("../middleware/isSuperAdmin");

router.get("/negocios", authMiddleware, isSuperAdmin, getNegocios);
router.post("/negocio", authMiddleware, isSuperAdmin, createNegocio);
router.put("/negocio/:id", authMiddleware, isSuperAdmin, toggleNegocio);
router.patch("/negocio/:id", authMiddleware, isSuperAdmin, updateNegocio);

module.exports = router;
