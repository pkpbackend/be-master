module.exports = {
  apps: [
    {
      name: 'sibaru-djp-backend-master-2023',
      script: 'npm run serve',
      instances: 1, // max instance = 0 | max
      exec_mode: 'fork',
      watch: false, // default: watch = true
      env: {
        NODE_ENV: 'staging',
      },
    },
  ],
}
