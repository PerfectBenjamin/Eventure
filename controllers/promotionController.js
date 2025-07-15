const Promotion = require("../models/Promotion");

// Create a new promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion)
      return res.status(404).json({ error: "Promotion not found" });
    res.json(promotion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a promotion by ID
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!promotion)
      return res.status(404).json({ error: "Promotion not found" });
    res.json(promotion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a promotion by ID
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion)
      return res.status(404).json({ error: "Promotion not found" });
    res.json({ message: "Promotion deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
