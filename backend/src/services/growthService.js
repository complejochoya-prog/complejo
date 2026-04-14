const { db } = require("../utils/firebase");

const getMonthlyGrowth = async () => {
  const snapshot = await db.collection("saas_clientes").get();
  const meses = {};

  snapshot.forEach(doc => {
    const c = doc.data();
    let fecha;
    
    if (c.createdAt && c.createdAt.toDate) {
      fecha = c.createdAt.toDate();
    } else {
      fecha = new Date(c.creadoEn || Date.now());
    }

    const key = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
    if (!meses[key]) meses[key] = 0;
    meses[key]++;
  });

  return meses;
};

module.exports = {
  getMonthlyGrowth
};
