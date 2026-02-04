const client = require('prom-client');

client.collectDefaultMetrics();

const jobsCreatedCounter = new client.Counter({
  name: 'producer_jobs_created_total',
  help: 'Total number of jobs created',
  labelNames: ['status']
});

const jobStatusCheckCounter = new client.Counter({
  name: 'producer_job_status_checks_total',
  help: 'Total number of job status checks',
  labelNames: ['status']
});

const rabbitConnectionAttempts = new client.Counter({
  name: 'producer_rabbit_connection_attempts_total',
  help: 'Total RabbitMQ connection attempts',
  labelNames: ['status']
});

const redisConnectionStatus = new client.Gauge({
  name: 'producer_redis_connected',
  help: 'Redis connection status (1=connected, 0=disconnected)'
});

const rabbitConnectionStatus = new client.Gauge({
  name: 'producer_rabbit_connected',
  help: 'RabbitMQ connection status (1=connected, 0=disconnected)'
});

const jobQueueSize = new client.Gauge({
  name: 'producer_job_queue_size',
  help: 'Current number of jobs in queue'
});

module.exports = {
  client,
  jobsCreatedCounter,
  jobStatusCheckCounter,
  rabbitConnectionAttempts,
  redisConnectionStatus,
  rabbitConnectionStatus,
  jobQueueSize,
  register: client.register
};
