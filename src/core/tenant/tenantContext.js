/**
 * tenant/tenantContext.js — Funciones de tenant para multi-tenancy
 * Enriquece datos con tenantId automáticamente.
 * NO reemplaza ConfigContext existente.
 */

export const getTenantId = () => {
  return localStorage.getItem("tenantId") || "default";
};

export const withTenant = (data) => {
  return {
    ...data,
    tenantId: getTenantId(),
  };
};
