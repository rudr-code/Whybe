const dataStore = require("../dataStore");

// GET /api/mess-menu
const getMessMenu = (req, res) => {
  const { day } = req.query;
  if (day) {
    const menu = dataStore.messMenu.find(m => m.day.toLowerCase() === day.toLowerCase());
    return res.json(menu || {});
  }
  res.json(dataStore.messMenu);
};

// PUT /api/mess-menu/:id
const updateMessMenu = (req, res) => {
  const updated = dataStore.update("messMenu", req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: "Menu entry not found" });
  res.json(updated);
};

module.exports = { getMessMenu, updateMessMenu };
