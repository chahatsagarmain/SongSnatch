const redis = require("redis");
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = redis.createClient({ url: redisUrl });

redisClient.connect().then(() => {
    console.log("started redis client");
}).catch((error) => {
    console.log(`error while startup ${error}`);
});

module.exports = (
    redisClient
);