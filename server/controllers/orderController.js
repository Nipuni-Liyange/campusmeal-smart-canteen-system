const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
};

// Generate order token
const generateOrderToken = () => {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `CM-${randomNumber}`;
};

// Student places an order
const createOrder = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity) {
      return res.status(400).json({
        message: "Menu item and quantity are required",
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

    if (menuItem.quantityAvailable < quantity) {
      return res.status(400).json({
        message: "Not enough quantity available",
      });
    }

    const today = getTodayDate();

    if (menuItem.date !== today) {
      return res.status(400).json({
        message: "You can only order items from today's menu",
      });
    }

    const totalAmount = menuItem.price * quantity;

    let orderToken = generateOrderToken();

    // Ensure token is unique
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
      quantity,
      price: menuItem.price,
      totalAmount,
      status: "Pending",
      orderToken,
      date: today,
    });

    // Reduce available quantity
    menuItem.quantityAvailable = menuItem.quantityAvailable - quantity;

    if (menuItem.quantityAvailable === 0) {
      menuItem.isAvailable = false;
    }

    await menuItem.save();

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

// Student views own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate("menuItem", "name description price")
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
      .populate("menuItem", "name price")
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

    // Add cancelled quantity back to menu item
    const menuItem = await MenuItem.findById(order.menuItem);

    if (menuItem) {
      menuItem.quantityAvailable = menuItem.quantityAvailable + order.quantity;
      menuItem.isAvailable = true;
      await menuItem.save();
    }

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

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};