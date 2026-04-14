const { db } = require("../utils/firebase");

const getSaasMetrics = async () => {
  const snapshot = await db.collection("saas_clientes").get();

  let activos = 0;
  let inactivos = 0;
  let mrr = 0;

  const planes = {
    BASIC: 0,
    PRO: 0,
    PREMIUM: 0
  };

  snapshot.forEach(doc => {
    const c = doc.data();

    if (c.estado === "activo") {
      activos++;
      // Usar monto_mensual si existe, sino fallback al precio del plan configurado
      const planPrices = { BASIC: 15000, PRO: 35000, PREMIUM: 60000 };
      const monto = c.monto_mensual || planPrices[c.plan] || 0;
      mrr += monto;
      if (planes[c.plan] !== undefined) planes[c.plan]++;
    } else {
      inactivos++;
    }
  });

  return {
    activos,
    inactivos,
    mrr,
    planes
  };
};

module.exports = {
  getSaasMetrics
};
