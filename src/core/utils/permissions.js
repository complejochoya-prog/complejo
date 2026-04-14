export const ROLES = {
    SUPER_ADMIN: "superadmin",
    ADMIN: "admin",
    CAJA: "caja",
    MOZO: "mozo",
    DELIVERY: "delivery",
    COCINA: "cocina"
};

/**
 * Checks if a user role is allowed to access a resource.
 * 'superadmin' and 'admin' have global access to everything.
 */
export function hasPermission(userRole, allowedRoles) {
    if (userRole === ROLES.SUPER_ADMIN) return true;
    
    // If no roles are defined, access is granted to everyone authenticated
    if (!allowedRoles || allowedRoles.length === 0) {
        return !!userRole;
    }
    
    // Admin has access to everything except strictly superadmin routes
    if (userRole === ROLES.ADMIN) {
        if (allowedRoles.includes(ROLES.SUPER_ADMIN) && !allowedRoles.includes(ROLES.ADMIN)) {
            return false;
        }
        return true;
    }
    
    return allowedRoles.includes(userRole);
}
