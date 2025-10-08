// server/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ API Đăng ký
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "✅ Đăng ký thành công!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "❌ Tên người dùng đã tồn tại!" });
  }
});

// ✅ API Đăng nhập
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(400).json({ error: "❌ Tài khoản không tồn tại!" });
  }

  if (user.password !== password) {
    return res.status(400).json({ error: "❌ Sai mật khẩu!" });
  }

  res.json({ message: "✅ Đăng nhập thành công!" });
});

module.exports = router;
