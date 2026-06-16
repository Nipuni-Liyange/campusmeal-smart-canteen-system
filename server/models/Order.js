const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    studentEmail: {
      type: String,
      required: true,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    foodName: {
      type: String,
      required: true,
    },

    recipeType: {
      type: String,
      required: true,
    },

    portionSize: {
      type: String,
      enum: ["Normal", "Full"],
      required: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    extras: [
      {
        name: String,
        price: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Preparing", "Ready", "Collected", "Cancelled", "Rejected"],
      default: "Pending",
    },

    orderToken: {
      type: String,
      required: true,
      unique: true,
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);