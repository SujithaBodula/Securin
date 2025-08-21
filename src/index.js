require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");
const importData = require("./utils/importData");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/recipes", recipeRoutes);

// Connect DB → Import Data → Start Server
const startServer = async () => {
  await connectDB();
  await importData(); // only once at startup

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
};

startServer();
