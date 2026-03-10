module.exports = {
  apps: [{
    name: 'maghreblabel-api',
    script: 'php',
    args: 'artisan serve --host=0.0.0.0 --port=8000',
    cwd: '/home/user/webapp/backend',
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production' }
  }]
}
