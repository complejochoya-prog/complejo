/**
 * events/eventBus.js — Bus de eventos simple
 * Comunicación desacoplada entre módulos.
 * NO reemplaza window events existentes.
 */

const listeners = {};

export const emit = (event, data) => {
  (listeners[event] || []).forEach((fn) => fn(data));
};

export const on = (event, fn) => {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
};

export const off = (event, fn) => {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((f) => f !== fn);
};
