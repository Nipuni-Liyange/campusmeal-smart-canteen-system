const MenuItem = require("../models/MenuItem");

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
};

// Add new menu item - Admin only
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, quantityAvailable, date, isAvailable } =
      req.body;

    if (!name || !description || price === undefined || quantityAvailable === undefined || !date) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      quantityAvailable,
      date,
      isAvailable,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating menu item",
      error: error.message,
    });
  }
};

// Get all menu items - Admin only
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching menu items",
      error: error.message,
    });
  }
};

// Get today's available menu items - Student side
const getTodayMenuItems = async (req, res) => {
  try {
    const today = getTodayDate();

    const menuItems = await MenuItem.find({
      date: today,
      isAvailable: true,
      quantityAvailable: { $gt: 0 },
    }).sort({ createdAt: -1 });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching today's menu",
      error: error.message,
    });
  }
};

// Update menu item - Admin only
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating menu item",
      error: error.message,
    });
  }
};

// Delete menu item - Admin only
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting menu item",
      error: error.message,
    });
  }
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getTodayMenuItems,
  updateMenuItem,
  deleteMenuItem,
};