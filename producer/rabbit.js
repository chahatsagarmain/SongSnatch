const amqplib = require("amqplib");

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";
let channel, connection;

async function connectRabbit() {
  connection = await amqplib.connect(RABBIT_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("song_jobs");
  return channel;
}

function getChannel() {
  if (!channel) throw new Error("Rabbit channel not initialized");
  return channel;
}

module.exports = {
  connectRabbit,
  getChannel,
};