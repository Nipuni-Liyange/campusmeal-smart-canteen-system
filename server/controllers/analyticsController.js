const Order = require("../models/Order");

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
};

// Admin gets today's analytics
const getTodayAnalytics = async (req, res) => {
  try {
    const today = getTodayDate();

    const orders = await Order.find({ date: today });

    const totalOrders = orders.length;

    const totalRevenue = orders
      .filter((order) => order.status !== "Cancelled" && order.status !== "Rejected")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === "Pending"
    ).length;

    const collectedOrders = orders.filter(
      (order) => order.status === "Collected"
    ).length;

    const itemSummary = {};

    orders.forEach((order) => {
      if (order.status !== "Cancelled" && order.status !== "Rejected") {
        if (!itemSummary[order.foodName]) {
          itemSummary[order.foodName] = 0;
        }

        itemSummary[order.foodName] += order.quantity;
      }
    });

    const foodDemand = Object.keys(itemSummary).map((foodName) => ({
      foodName,
      quantity: itemSummary[foodName],
    }));

    let mostOrderedItem = null;

    if (foodDemand.length > 0) {
      mostOrderedItem = foodDemand.reduce((max, item) =>
        item.quantity > max.quantity ? item : max
      );
    }

    res.status(200).json({
      date: today,
      totalOrders,
      totalRevenue,
      pendingOrders,
      collectedOrders,
      mostOrderedItem,
      foodDemand,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getTodayAnalytics,
};