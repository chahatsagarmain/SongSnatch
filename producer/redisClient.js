const redis = require("redis");
const redisClient = redis.createClient();

redisClient.connect().then(() => {
    console.log("started redis client");
}).catch((error) => {
    console.log(`error while startup ${error}`);
});

module.exports = (
    redisClient
);