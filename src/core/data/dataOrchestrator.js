/**
 * data/dataOrchestrator.js — Orquestador de datos centralizado
 * Estrategia: local-first + intento de sync con backend.
 * NO reemplaza servicios existentes, solo los envuelve.
 */

import { api } from "../api/client";
import { withTenant } from "../tenant/tenantContext";

export const saveData = async (key, data) => {
  const payload = withTenant(data);

  // cache local
  localStorage.setItem(key, JSON.stringify(payload));

  try {
    // backend (fuente futura)
    await api.post(`/api/${key}`, payload);
  } catch (e) {
    console.warn("Backend no disponible, usando modo local");
  }

  return payload;
};

export const getData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
