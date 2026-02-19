const mongoose = require("mongoose");

const MaintenancePlanSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bikeId: { type: mongoose.Schema.Types.ObjectId, ref: "Bike", required: true, index: true },

    type: { type: String, required: true, trim: true, maxlength: 40 },

    intervalKm: { type: Number, min: 0 },   // optional
    intervalDays: { type: Number, min: 0 }, // optional

    lastServiceOdometerKm: { type: Number, min: 0 },
    lastServiceDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenancePlan", MaintenancePlanSchema);
