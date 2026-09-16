const MessMenu = require("../models/MessMenu");

// GET /api/mess-menu
const getMessMenu = async (req, res) => {
  try {
    const { day } = req.query;
    if (day) {
      const menu = await MessMenu.findOne({
        day: new RegExp(`^${day.trim()}$`, "i"),
      }).lean();
      return res.json(menu || {});
    }
    const menus = await MessMenu.find().lean();
    return res.json(menus);
  } catch (err) {
    console.error("Error in getMessMenu:", err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/mess-menu/:id
const updateMessMenu = async (req, res) => {
  try {
    const updated = await MessMenu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!updated) return res.status(404).json({ message: "Menu entry not found" });
    return res.json(updated);
  } catch (err) {
    console.error("Error in updateMessMenu:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessMenu, updateMessMenu };

