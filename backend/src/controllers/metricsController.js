const { getSaasMetrics } = require("../services/saasMetricsService");
const { getChurnRate } = require("../services/churnService");
const { getMonthlyGrowth } = require("../services/growthService");
const logger = require("../utils/logger");

const getMetrics = async (req, res, next) => {
  try {
    const metrics = await getSaasMetrics();
    const churn = await getChurnRate();
    const growth = await getMonthlyGrowth();

    res.json({
      success: true,
      data: {
        ...metrics,
        ...churn,
        growth
      }
    });
  } catch (error) {
    logger.error(`Error obteniendo métricas: ${error.message}`);
    res.status(500).json({
      success: false,
      error: "Error obteniendo métricas"
    });
  }
};

module.exports = {
  getMetrics
};
