const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helper");
const { model } = require("mongoose");

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, userName } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(403).json({
        error: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserData = {
      firstName,
      lastName,
      email,
      userName,
      password: hashedPassword,
    };
    const newUser = await User.create(newUserData);

    const token = await getToken(email, newUser);

    const userToReturn = { ...newUser.toJSON(), token };
    delete userToReturn.password;

    return res.status(200).json(userToReturn);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) {
      return res.status(403).json({ error: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      return res.status(403).json({ error: "Invalid Credentials" });
    }

    const token = await getToken(foundUser.email, foundUser);
    const userToReturn = { ...foundUser.toJSON(), token };
    delete userToReturn.password;

    return res.status(200).json(userToReturn);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
