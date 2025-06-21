const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Please provide a name"],
      trim: true,
      lowercase: true,
      validate: [validator.isAlpha, "Name must only contain letters"],
    },
    username: {
      type: String,
      require: [true, "Please provide a username"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [
        validator.isAlphanumeric,
        "Username must only contain letters and numbers",
      ],
    },
    password: {
      type: String,
      require: [true, "Please provide a password"],
      trim: true,
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      require: [true, "Please confirm your password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match!",
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
