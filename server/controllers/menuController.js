const MenuItem = require("../models/MenuItem");

// Get today's date in Sri Lanka time
const getTodayDate = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Colombo",
  });
};

// Admin creates a menu item
const createMenuItem = async (req, res) => {
  try {
    const {
      name,
      recipeType,
      description,
      normalPrice,
      fullPrice,
      date,
      isAvailable,
    } = req.body;

    if (!name || !recipeType || !description || !normalPrice || !fullPrice || !date) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const menuItem = await MenuItem.create({
      name,
      recipeType,
      description,
      normalPrice,
      fullPrice,
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

// Admin gets all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ createdAt: -1 });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching menu items",
      error: error.message,
    });
  }
};

// Student gets today's available menu items
const getTodayMenu = async (req, res) => {
  try {
    const today = getTodayDate();

    const menuItems = await MenuItem.find({
      date: today,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching today's menu",
      error: error.message,
    });
  }
};

// Admin deletes a menu item
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
  getTodayMenu,
  deleteMenuItem,
};