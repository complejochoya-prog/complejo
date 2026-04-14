const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET = process.env.JWT_SECRET || "SISTEMA_SECRET";

/**
 * Authenticates a user and returns a JWT token.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // In a real app, use bcrypt to compare passwords
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, negocioId: user.negocioId },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                negocioId: user.negocioId
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
