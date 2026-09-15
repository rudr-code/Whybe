const express = require("express");
const router = express.Router();
const { getMessMenu, updateMessMenu } = require("../controllers/messMenuController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/", getMessMenu);
router.put("/:id", authorize("admin"), updateMessMenu);

module.exports = router;
