import React from "react";

/**
 * MissingPage Component
 * Fallback for routes that haven't been implemented yet.
 */
export default function MissingPage({ name }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          Página No Encontrada
        </h1>
        <p className="text-slate-400 mt-2">
          El componente <span className="text-gold font-mono">{name}</span> aún no ha sido implementado.
        </p>
      </div>
    </div>
  );
}
