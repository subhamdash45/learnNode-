const express  = require("express")
const mongoose = require("mongoose")
const {connectDB} = require("./mongooseConfig/dataBaseCon")
const { User } = require("./mongooseModels/user")

const app = express()
const port = 3000

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Same DB/connection as POST /signup — use to verify Compass vs app (host + db must match).
app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find().lean();
    res.json({
      db: mongoose.connection.name,
      host: mongoose.connection.host,
      count: users.length,
      users,
    });
  } catch (e) {
    next(e);
  }
});

app.post("/signup", async (req, res, next) => {
  const { firstName, lastName, age, city, pin } = req.body;
  if (!firstName || !lastName || !age || !city || !pin) {
    return res.status(400).send({ message: "All fields are required", success: false, data: null });
  }
  try {
    const user = new User({ firstName, lastName, age, city, pin });
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
    res.status(201).send({ data: user, message: "User created successfully", success: true });
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
  res.status(status).send({
    message: err.message || "Internal server error",
    success: false,
    data: null,
  });
});

connectDB().then(()=>{
  app.listen(port, ()=>{
    console.log(`learnMongoose.js — MongoDB connected. API: http://localhost:${port}  POST /signup`);
  })
}).catch((err)=>{
  console.log('Error connecting to MongoDB', err);
  process.exit(1);
})