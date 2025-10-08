require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ ChatApp Server đang chạy!");
});

// === Khởi tạo server và Socket.IO ===
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST", "DELETE"] },
});

// === Kết nối MongoDB ===
const mongoURI = process.env.MONGODB_URI;
console.log("📦 Mongo URI:", mongoURI ? mongoURI : "❌ Không thấy ENV MONGODB_URI");

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ Kết nối MongoDB thành công"))
  .catch((err) => console.log("❌ MongoDB lỗi:", err.message));

// === Schemas ===
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

const channelSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});
const Channel = mongoose.model("Channel", channelSchema);

const messageSchema = new mongoose.Schema({
  channelId: String,
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model("Message", messageSchema);

// === API ===
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "✅ Đăng ký thành công!" });
  } catch {
    res.status(400).json({ error: "❌ Tên người dùng đã tồn tại!" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "❌ Tài khoản không tồn tại!" });
  if (user.password !== password) return res.status(400).json({ error: "❌ Sai mật khẩu!" });
  res.json({ message: "✅ Đăng nhập thành công!", role: user.role });
});

app.post("/create-admin", async (req, res) => {
  const { username, password } = req.body;
  const admin = new User({ username, password, role: "admin" });
  await admin.save();
  res.json({ message: "✅ Admin created" });
});

app.get("/channels", async (req, res) => {
  const channels = await Channel.find().sort({ createdAt: 1 });
  res.json(channels);
});

app.post("/channels", async (req, res) => {
  const { name } = req.body;
  const existing = await Channel.findOne({ name });
  if (existing) return res.status(400).json({ error: "❌ Kênh đã tồn tại!" });
  const channel = new Channel({ name });
  await channel.save();
  res.status(201).json({ message: "✅ Tạo kênh thành công!", channel });
});

app.delete("/channels/:id", async (req, res) => {
  const { id } = req.params;
  await Channel.findByIdAndDelete(id);
  await Message.deleteMany({ channelId: id });
  res.json({ message: "✅ Đã xoá kênh!" });
});

// === Socket.IO ===
io.on("connection", (socket) => {
  console.log("🔗 Người dùng:", socket.id);

  socket.on("join channel", async (channelId) => {
    socket.join(channelId);
    const oldMessages = await Message.find({ channelId }).sort({ createdAt: 1 });
    socket.emit("old messages", oldMessages);
  });

  socket.on("chat message", async (msg) => {
    const { channelId, username, text } = msg;
    const newMsg = new Message({ channelId, username, text });
    await newMsg.save();
    io.to(channelId).emit("chat message", newMsg);
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${socket.id} đã ngắt`);
  });
});

// === Chạy server ===
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server chạy trên cổng ${PORT}`));
