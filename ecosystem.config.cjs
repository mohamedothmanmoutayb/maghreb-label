module.exports = {
  apps: [
    {
      name: 'maghreblabel-api',
      script: 'php',
      args: 'artisan serve --host=0.0.0.0 --port=8000',
      cwd: '/home/user/webapp/backend',
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' }
    },
    {
      name: 'maghreblabel-frontend',
      script: 'node_modules/.bin/serve',
      args: '-s dist -l 5173',
      cwd: '/home/user/webapp/frontend',
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' }
    }
  ]
}
