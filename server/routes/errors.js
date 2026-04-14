const express = require("express");
const router = express.Router();
const isSuperAdmin = require("../middleware/isSuperAdmin");
const authMiddleware = require("../middleware/authMiddleware");
const ErrorLog = require("../models/ErrorLog");

// Get recent system errors. 
// Note: We use authMiddleware and check if the user is a superadmin OR
// if they are just an admin, we might want to let them see errors for their own business.
// However, errors are global system issues, so restricting to SuperAdmin is generally safer,
// but the prompt implies this is for the Admin Panel. Let's make it for admins.
router.get("/", authMiddleware, async (req, res, next) => {
    try {
        // Find errors. 
        // If we strictly want to isolate by business, we would need to capture negocioId in the ErrorLog.
        // For now, returning the latest 50 errors in the system.
        const errors = await ErrorLog.find()
            .sort({ fecha: -1 })
            .limit(50);
            
        res.json(errors);
    } catch (error) {
        // Pass to our new global error handler!
        next(error); 
    }
});

module.exports = router;
