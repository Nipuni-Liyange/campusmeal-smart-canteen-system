const express = require("express");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Student routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.put("/:id/cancel", protect, cancelOrder);

// Admin routes
router.get("/all", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;