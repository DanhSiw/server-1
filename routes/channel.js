const express = require("express");
const Channel = require("../models/Channel");
const router = express.Router();

// Tạo kênh mới
router.post("/channels", async (req, res) => {
  const { name } = req.body;
  try {
    const channel = new Channel({ name });
    await channel.save();
    res.status(201).json({ message: "✅ Tạo kênh thành công!", channel });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "❌ Kênh đã tồn tại hoặc lỗi khác!" });
  }
});

// Lấy danh sách kênh
router.get("/channels", async (req, res) => {
  const channels = await Channel.find().sort({ createdAt: 1 });
  res.json(channels);
});

module.exports = router;
