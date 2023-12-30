const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/User");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { name, thumbnail, track } = req.body;

      if (!name || !thumbnail || !track) {
        return res.status(301).json({
          error: "Insufficient details to create song",
        });
      }

      const artist = req.user._id;
      const songDetails = { name, thumbnail, track, artist };
      const createdSong = await Song.create(songDetails);
      return res.status(200).json(createdSong);
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

router.get(
  "/get/mysongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const songs = await Song.find({ artist: req.user._id });
      return res.status(200).json({ data: songs });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

router.get(
  "/get/artist/:artistID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { artistID } = req.params;
      const artist = await User.find({ _id: artistID });

      if (!artist) {
        return res.status(301).json({ error: "Artist doesnot exist" });
      }

      const songs = await Song.find({ artist: artistID });
      return res.status(200).json({ data: songs });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

router.get(
  "/get/songname/:songName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { songName } = req.params;
      const songs = await Song.find({ name: songName });
      return res.status(200).json({ data: songs });
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

module.exports = router;
