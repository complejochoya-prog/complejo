const logger = require('../utils/logger');
const { auth } = require('../utils/firebase');

/**
 * CHECK ROLE MIDDLEWARE
 * Protege endpoints según el rol del usuario autenticado.
 */
const checkRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Inyectado por verifyAuthToken
      const userRole = user.role || req.headers['x-user-role']; // Fallback headers para mozos sin claims

      if (!userRole) {
        return res.status(403).json({
          success: false,
          error: "Rol no definido para el usuario",
          code: "ROLE_UNDEFINED"
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole.toLowerCase())) {
        logger.warn(`🚫 [AUTH] Acceso denegado: Usuario ${user.uid} intentó acceder a ${req.originalUrl} con rol ${userRole}`);
        return res.status(403).json({
          success: false,
          error: "No tienes permisos de rol suficientes para esta acción",
          code: "INSUFFICIENT_PERMISSIONS"
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkRole };
