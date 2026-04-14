const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true, // ✅ allow cookies
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// routes
const authRoutes = require("./routes/auth.routes");
const dsaRoutes = require("./routes/dsa.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const skillRoutes = require("./routes/skill.routes");
const userRoutes = require("./routes/user.routes");
const jdRoutes = require("./routes/jd.routes");
const companyRoutes = require("./routes/company.routes");

app.use("/api/auth", authRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/user", userRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/company-problems", companyRoutes);

// error handler
const errorHandler = require("./middleware/error.middleware");
app.use(errorHandler);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

app.listen(5000, () => console.log("Server running on port 5000"));