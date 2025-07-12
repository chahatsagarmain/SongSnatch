const express = require("express")
const dotenv = require("dotenv");
const redisClient = require("./redisClient.js");
const songRouter = require("./router/song");
const { connectRabbit } = require("./rabbit.js");

dotenv.config("./.env");

const PORT = process.env.PORT;
const REDIS_PORT = process.env.REDIS_PORT;
const app = express();

const routerV1 = express.Router();

connectRabbit().then(() => {
    console.log("connected rabbit");
}).catch((error) => {
    console.log(`error connecting rabbit ${error}`);
});

app.get("/" , (req , res) => {
   res.status(200).json({"message" : "/ route active"})
});

app.get("/all" , async (req , res) => {
    // get all of redis data 
    try{
        const keys = await redisClient.keys("*"); // get all keys with the wildcard patten;
        if(keys.length == 0){
            return res.status(200).json({"data" : []});
        }
        
        var jobs = keys.map(async (key , index) => {
            const data = await redisClient.get(key);
            return data;
        });

        // jobs is ending up storing [Promises , Promises] we need to resolve it all using Promise.all
        jobs = await Promise.all(jobs);
        
        return res.status(200).json({"data" : jobs});
    }
    catch(error){
        console.log(error);
        return res.status(500);
    }
});

routerV1.use("/v1",songRouter);

app.use(routerV1);

app.listen(PORT , () => { 
    console.log(`starting up server at ${PORT}` );
});
