module.exports = {
  apps: [
    {
      name: 'doctsun-server',
      script: 'dist/main.js',
      cwd: './apps/server',
      instances: 1,
      autorestart: true,
    },
  ],
}