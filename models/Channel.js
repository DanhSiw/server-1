// models/Channel.js
const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Channel", channelSchema);
