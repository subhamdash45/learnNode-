const express  = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const {connectDB} = require("../mongooseConfig/dataBaseCon")
const jwt = require("jsonwebtoken")
const { User } = require("../mongooseModels/user")
const { authMiddleware } = require("../middlewares/auth")


const app = express()
const port = 3000

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Same DB/connection as POST /signup — use to verify Compass vs app (host + db must match).
app.post("/signup", async (req, res, next) => {
  const { firstName, lastName, age, city, pin, email, gender, password } = req.body;
  if (!firstName || !lastName ||  !pin || !email || !gender || !password) {
    return res.status(400).send({ message: "All fields are required", success: false, data: null });
  }
  try {
    const user = new User({ firstName, lastName, age, city, pin, email, gender, password });
    await user.save();
    const fromCollection = await User.collection.findOne({ _id: user._id });
    console.log(
      "signup saved → db:",
      mongoose.connection.name,
      "collection: users _id:",
      user._id,
      "| same-connection readback:",
      fromCollection ? "FOUND in DB" : "NOT FOUND (unexpected)"
    );
    res.status(201).json({ data: user, message: "User created successfully", success: true });
  } catch (error) {
    next(error);
  }
});

// Login: never decrypt — compare plain password to stored hash.
app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required", success: false, data: null });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password", success: false, data: null });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password", success: false, data: null });
    }

    // res.cookie("token", user.generateToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    console.log(token, "token after login");
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.status(200).json({ data: user, message: "Login successful", success: true });
  } catch (error) {
    next(error);
  }
});

app.get("/profile", authMiddleware, async (req, res, next) => {
  try {
    res.status(200).json({ data: req.user, message: "User found successfully", success: true });
  } catch (e) {
    next(e);
  }
});

app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json({
      // db: mongoose.connection.name,
      // host: mongoose.connection.host,
      count: users.length,
      users,
    });
  } catch (e) {
    next(e);
  }
});

app.get("/user/:id", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false, data: null });
    }
    res.status(200).json({ data: user, message: "User found successfully", success: true });
  } catch (error) {
    next(error);
  }
});

app.patch("/user/:id", async (req, res, next) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "age",
      "city",
      "pin",
      "email",
      "gender",
      "password",
    ];
    const updates = {};
    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({
          message: `Field "${field}" is not allowed`,
          success: false,
          data: null,
        });
      }
      updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
        success: false,
        data: null,
      });
    }

    updates.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false, data: null });
    }
    res.status(200).json({ data: user, message: "User updated successfully", success: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/user/:id", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully", success: true, data: null });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  const status =
    err.name === "ValidationError" || err.name === "CastError"
      ? 400
      : err.code === 11000
        ? 409
        : typeof err.status === "number" && err.status >= 400 && err.status < 600
          ? err.status
          : 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    success: false,
    data: null,
  });
});

connectDB().then(()=>{
  app.listen(port, ()=>{
    console.log(`learnMongoose.js — MongoDB connected. API: http://localhost:${port}`);
  })
}).catch((err)=>{
  console.log('Error connecting to MongoDB', err);
  process.exit(1);
})