const amqplib = require("amqplib");

const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";
let channel, connection;

async function connectRabbit() {
  connection = await amqplib.connect(RABBIT_URL);
  channel = await connection.createChannel();

  const dlx = "song_jobs_dlx";
  const dlq = "song_jobs_dlq";

  await channel.assertExchange(dlx, "direct", { durable: true });
  await channel.assertQueue(dlq, { durable: true });
  await channel.bindQueue(dlq, dlx, "song_jobs");

  await channel.assertQueue("song_jobs", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": dlx,
      "x-dead-letter-routing-key": "song_jobs",
    },
  });

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