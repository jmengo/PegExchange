const mongoose = require("mongoose");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    default: 1
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
})

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
}

userSchema.methods.generateAndSaveAuthToken = async function () {
  const user = this;
  const token = jsonwebtoken.sign({
    _id: user.id.toString()
  }, "tempSecret");
  user.tokens = user.tokens.concat({
    token
  });
  await user.save();
  return token;
}

userSchema.statics.handleLogin = async (username, password) => {
  const user = await User.findOne({
    username
  });
  if (!user) {
    throw new Error("Unable to login");
  }
  return user;
}

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({
    username
  })
  if (!user) {
    throw new Error('Unable to login')
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to login')
  }
  return user
}

userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model("User", userSchema)

module.exports = User;