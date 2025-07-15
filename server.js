require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const path = require("path");

// (Replace the below string with your actual Atlas connection string)
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Atlas connected."))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const eventRoutes = require("./routes/events");
app.use("/api/events", eventRoutes);

const userRoutes = require("./routes/users");
app.use("/users", userRoutes);

const ticketRoutes = require("./routes/tickets");
app.use("/api/tickets", ticketRoutes);

const paymentRoutes = require("./routes/payments");
app.use("/api/payments", paymentRoutes);

const promotionRoutes = require("./routes/promotions");
app.use("/promotions", promotionRoutes);

const categoryRoutes = require("./routes/categories");
app.use("/categories", categoryRoutes);

const notificationRoutes = require("./routes/notifications");
app.use("/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Hello, Express is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
