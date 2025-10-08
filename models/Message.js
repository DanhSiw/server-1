// models/Message.js
const messageSchema = new mongoose.Schema({
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, // 🔑
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});
