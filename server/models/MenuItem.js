const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    recipeType: {
      type: String,
      required: true,
      trim: true,
      enum: ["Fish", "Chicken", "Egg", "Sausages", "Vegetarian", "Other"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    normalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    fullPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: String,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);