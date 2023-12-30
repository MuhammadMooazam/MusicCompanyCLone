const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");

const app = express();
const port = 8080;

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URL)
  .then((x) => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error while connecting to MongoDB");
  });

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "despacito";
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ id: jwt_payload.sub });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

app.get("/", (req, res) => {
  res.send("This is Syed Muhammad Mooazam's SPOTIFY Clone");
});

app.use("/auth", authRoutes);

app.use("/song", songRoutes);

app.use("/playlist", playlistRoutes);

app.listen(port, () => {
  console.log("App is running on port " + port);
});
