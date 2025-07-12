const songRouter = require("express").Router();
const { findSongController , getJobStatus , getSong } = require("../controller/song.js");

songRouter.post("/find" , findSongController);
songRouter.get("/status" , getJobStatus);
songRouter.get("/download/:song", getSong);

module.exports = (
    songRouter
);