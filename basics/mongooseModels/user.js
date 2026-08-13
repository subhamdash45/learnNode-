const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: false,
    trim: true,
    min: 18,
    max: 50,
  },
  city: {
    type: String,
    required: false,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate: {
      validator: function (value) {
        // Skip digit check for already-hashed passwords (bcrypt hashes start with $2)
        if (typeof value === "string" && value.startsWith("$2")) return true;
        return /\d/.test(value);
      },
      message: "Password must contain at least one number",
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "prefer not to say"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before save (signup / doc.save()). Never store plain text.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Hash password when using findByIdAndUpdate / findOneAndUpdate (PATCH).
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() || {};
  const password = update.password ?? update.$set?.password;
  if (!password) return;
  const hashed = await bcrypt.hash(password, 10);
  if (update.password !== undefined) update.password = hashed;
  if (update.$set?.password !== undefined) update.$set.password = hashed;
});

// Login: compare plain password with hash in DB (no decrypt).
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Do not send password hash in API responses by default.
userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
