/**
 * api/client.js — Cliente HTTP centralizado
 * Capa mínima sobre fetch para uso futuro.
 * NO reemplaza apiClient.js existente, solo agrega opción nueva.
 */

export const api = {
  get: async (url) => {
    const res = await fetch(url);
    return res.json();
  },
  post: async (url, data) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
