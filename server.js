// =======================
// BASIC SETUP
// =======================
console.log("🔥 server.js file loaded");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// ENV CHECK
// =======================
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

console.log("ENV MONGODB_URI =", MONGODB_URI);
console.log("ENV PORT =", PORT);

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// =======================
// MONGODB CONNECT
// =======================
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// =======================
// SCHEMA & MODEL
// =======================
const CodeSchema = new mongoose.Schema(
  {
    encrypted: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Code = mongoose.model("Code", CodeSchema);

// =======================
// API ROUTES
// =======================

// Save encrypted code
app.post("/api/save", async (req, res) => {
  try {
    const { encrypted } = req.body;

    if (!encrypted) {
      return res.status(400).json({ error: "Encrypted code required" });
    }

    const doc = await Code.create({ encrypted });
    res.json({ id: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
});

// Get encrypted code by ID
app.get("/api/get/:id", async (req, res) => {
  try {
    const doc = await Code.findById(req.params.id).select("encrypted");

    if (!doc) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ encrypted: doc.encrypted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// =======================
// FRONTEND SERVE
// =======================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
