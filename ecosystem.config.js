module.exports = {
  apps: [
    {
      name: 'server',
      script: 'dist/index.js',
      node_args: '-r',
      instances: 'max',
      autorestart: true,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'prod',
      },
    },
    {
      name: 'worker-cron',
      script: 'dist/workers/cron.worker.js',
      node_args: '-r',
      instances: 1,
      autorestart: true,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'prod',
      },
    },
    {
      name: 'worker-queue',
      script: 'dist/workers/queue.worker.js',
      node_args: '-r',
      instances: 1,
      autorestart: true,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'prod',
      },
    },
  ],
}
