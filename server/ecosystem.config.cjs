module.exports = {
  apps: [
    {
      name: 'vocab-master-web',
      script: 'dist/src/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'file:./prisma/prod.db',
      },
    },
  ],
};
