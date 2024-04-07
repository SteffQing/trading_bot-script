// /api/index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api", async (req, res) => {
  try {
    const { symbols } = req.query;

    res.json({ res: "results" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(4000, () => {
  console.log("Server started on port 4000");
});

module.exports = app;
