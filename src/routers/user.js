const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send({
      user
    })
  } catch (err) {
    res.status(400).send()
  }
})

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    )
    const token = await user.generateAndSaveAuthToken();
    res.send({
      user,
      token
    })
  } catch (err) {
    res.status(400).send(err)
  }
})

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("User logged out");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/users/me", auth, async (req, res) => {
  try {
    res.send(req.user)
  } catch (err) {
    res.status(400).send(err)
  }
})

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.delete()
    res.status(202).send()
  } catch (err) {
    res.status(400).send(err)
  }
})

module.exports = router;