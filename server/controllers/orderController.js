const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Get today's date in Sri Lanka time
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
};

// Check whether current time is before 3.00 PM Sri Lanka time
const isBeforeDeadline = () => {
  const now = new Date();

  const sriLankaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
  );

  const hours = sriLankaTime.getHours();
  const minutes = sriLankaTime.getMinutes();

  // Deadline: 3.00 PM
  if (hours < 18) {
    return true;
  }

  if (hours === 18 && minutes === 0) {
    return true;
  }

  return false;
};

// Generate order token
const generateOrderToken = () => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `CM-${randomNumber}`;
};

// Fixed extra item prices
const extraPrices = {
  Egg: 50,
  Sausages: 50,
  Chicken: 80,
  Fish: 50,
};

// Student places an order
const createOrder = async (req, res) => {
  try {
    const { menuItemId, portionSize, extras, quantity } = req.body;

    if (!menuItemId || !portionSize) {
      return res.status(400).json({
        message: "Menu item and portion size are required",
      });
    }

    if (!["Normal", "Full"].includes(portionSize)) {
      return res.status(400).json({
        message: "Invalid portion size",
      });
    }
    const orderQuantity = Number(quantity) || 1;

if (orderQuantity < 1) {
  return res.status(400).json({
    message: "Quantity must be at least 1",
  });
}

    if (!isBeforeDeadline()) {
      return res.status(400).json({
        message: "Ordering is closed for today. Please order before 6.00 PM.",
      });
    }

    const menuItem = await MenuItem.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    if (!menuItem.isAvailable) {
      return res.status(400).json({
        message: "This food item is not available",
      });
    }

    const today = getTodayDate();

    if (menuItem.date !== today) {
      return res.status(400).json({
        message: "You can only order items from today's menu",
      });
    }

    const basePrice =
      portionSize === "Normal" ? menuItem.normalPrice : menuItem.fullPrice;

    const selectedExtras = Array.isArray(extras) ? extras : [];

    const calculatedExtras = selectedExtras.map((extraName) => ({
      name: extraName,
      price: extraPrices[extraName] || 0,
    }));

    const extrasTotal = calculatedExtras.reduce(
      (sum, extra) => sum + extra.price,
      0
    );

    const oneMealTotal = basePrice + extrasTotal;
    const totalAmount = oneMealTotal * orderQuantity; 

    let orderToken = generateOrderToken();

    let existingToken = await Order.findOne({ orderToken });

    while (existingToken) {
      orderToken = generateOrderToken();
      existingToken = await Order.findOne({ orderToken });
    }

    const order = await Order.create({
      student: req.user._id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      menuItem: menuItem._id,
      foodName: menuItem.name,
      recipeType: menuItem.recipeType,
      portionSize,
      quantity: orderQuantity,
      basePrice,
      extras: calculatedExtras,
      totalAmount,
      status: "Pending",
      orderToken,
      date: today,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while placing order",
      error: error.message,
    });
  }
};

// Student views own orders - last 7 days
const getMyOrders = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await Order.find({
      student: req.user._id,
      createdAt: { $gte: sevenDaysAgo },
    })
      .populate("menuItem", "name recipeType description normalPrice fullPrice")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching your orders",
      error: error.message,
    });
  }
};

// Admin views all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("student", "name email regNo")
      .populate("menuItem", "name recipeType normalPrice fullPrice")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching all orders",
      error: error.message,
    });
  }
};

// Admin updates order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "Preparing",
      "Ready",
      "Collected",
      "Cancelled",
      "Rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

// Student cancels own pending order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can cancel only your own orders",
      });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while cancelling order",
      error: error.message,
    });
  }
};

// Admin deletes an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
};
