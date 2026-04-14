const { db } = require("../utils/firebase");

const getChurnRate = async () => {
  const snapshot = await db.collection("saas_clientes").get();

  let total = snapshot.size;
  let cancelados = 0;

  snapshot.forEach(doc => {
    const c = doc.data();
    if (c.estado === "suspendido") cancelados++;
  });

  const churn = total > 0 ? (cancelados / total) * 100 : 0;

  return {
    total_clientes: total,
    cancelados,
    churn_rate: churn.toFixed(2) + "%"
  };
};

module.exports = {
  getChurnRate
};
