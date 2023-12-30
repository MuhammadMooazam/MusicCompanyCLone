const express = require("express");
const router = express.Router();
const passport = require("passport");
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.user;
      const { name, thumbnail, songs } = req.body;

      if (!name || !thumbnail || !songs) {
        return res.status(304).json({
          error: "Insufficient details to create playlist",
        });
      }

      const playlistData = {
        name,
        thumbnail,
        owner: currentUser._id,
        songs,
        collaborators: [],
      };
      const playlist = await Playlist.create(playlistData);
      return res.status(200).json(playlist);
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

router.get(
  "/get/playlist/:playlistID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const playlistID = req.params.playlistID;
      const playlist = await Playlist.findOne({ _id, playlistID });

      if (!playlist) {
        return res.status(304).json({
          error: "Invalid Playlist ID",
        });
      }

      return res.status(200).json(playlist);
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
      const artistID = req.params.artistID;

      const artist = await User.findOne({ _id, artistID });

      if (!artist) {
        return res.status(304).json({
          error: "Invalid Artist ID",
        });
      }

      const playlists = await Playlist.find({ owner, artistID });

      return res.status(200).json(playlists);
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

router.post(
  "/add/song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const currentUser = req.user;
      const { playlistID, songID } = req.body;
      const playlist = await Playlist.findOne({ _id: playlistID });

      if (!playlist) {
        return res.status(304).json({
          error: "Playlist doesnot exist",
        });
      }

      if (
        playlist.owner != currentUser._id ||
        !playlist.collaborators.includes(currentUser._id)
      ) {
        return res.status(400).json("Not Allowed");
      }

      const song = await Song.findOne({ _id: songID });

      if (!song) {
        return res.status(304).json({
          error: "Song doesnot exist",
        });
      }

      playlist.song.push(songID);
      await playlist.save();
      return res.status(200).json(playlist);
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }
  }
);

module.exports = router;
