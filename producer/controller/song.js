const redisClient = require("../redisClient.js")
const uuid = require("uuid");
const fs = require("fs");
const { getChannel } = require("../rabbit.js");
const path = require("path");

async function findSongController(req , res , next){
    const { url } = req.query;
    if(!url) return res.status(404).json({"message" : "missing url"});
    const jobId = uuid.v7();
    var jobData = {
        status: "queued",
        url: url,
        timestamp: new Date().toISOString()
    };

    try {
        await redisClient.set(jobId , JSON.stringify(jobData));
        const ch = getChannel();
        jobData = {...jobData , jobId : jobId};
        ch.sendToQueue("song_jobs",Buffer.from(JSON.stringify(jobData)));
        return res.status(200).json({ message: "Job created", jobId });
    } catch (err) {
        console.error("Redis error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getJobStatus(req , res , next) {
    const { jobId } = req.query;
    if(!jobId){
        return res.status(404).json({"message" : "job Id missing"});
    }

    try{
        const data = await redisClient.get(jobId);
        return res.status(200).json({"data" : data});
    }
    catch(error){
        return res.status(500);
    }
}

function getSong(req , res , next) {
    const song = req.params.song;
    if(!song) return res.send(404).json({"message" : "No song name specified"});
    const songPath = path.join("/temp/songs/",song);
    const absSongPath = path.resolve(songPath);
    if(fs.existsSync(absSongPath)){
        return res.status(200).sendFile(absSongPath);
    }
    return res.status(404).json({"message" : "Song does not exist"})
}

module.exports = {
    findSongController,
    getJobStatus,
    getSong
};