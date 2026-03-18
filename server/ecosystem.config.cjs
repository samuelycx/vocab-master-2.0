const path = require('path');

const sharedRoot = String(process.env.SERVER_SHARED_ROOT || '').trim();
const sharedPrismaRoot = String(
  process.env.SERVER_SHARED_PRISMA_ROOT || (sharedRoot ? path.join(sharedRoot, 'prisma') : ''),
).trim();
const sharedUploadsRoot = String(
  process.env.SERVER_SHARED_UPLOADS_ROOT || (sharedRoot ? path.join(sharedRoot, 'uploads') : ''),
).trim();
const sharedLogsRoot = String(
  process.env.SERVER_SHARED_LOGS_ROOT || (sharedRoot ? path.join(sharedRoot, 'logs') : ''),
).trim();
const sharedEnvFile = String(
  process.env.SERVER_ENV_FILE || (sharedRoot ? path.join(sharedRoot, 'env', 'server.env') : ''),
).trim();
const defaultDbUrl = sharedPrismaRoot
  ? `file:${path.join(sharedPrismaRoot, 'dev.db')}`
  : `file:${path.join(__dirname, 'prisma', 'dev.db')}`;

const appConfig = {
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
    DATABASE_URL: process.env.DATABASE_URL || defaultDbUrl,
    ...(sharedRoot ? { SERVER_SHARED_ROOT: sharedRoot } : {}),
    ...(sharedUploadsRoot ? { SERVER_SHARED_UPLOADS_ROOT: sharedUploadsRoot } : {}),
    ...(sharedLogsRoot ? { SERVER_SHARED_LOGS_ROOT: sharedLogsRoot } : {}),
  },
};

if (sharedEnvFile) {
  appConfig.env_file = sharedEnvFile;
}

if (sharedLogsRoot) {
  appConfig.out_file = path.join(sharedLogsRoot, 'vocab-master-web-out.log');
  appConfig.error_file = path.join(sharedLogsRoot, 'vocab-master-web-error.log');
  appConfig.merge_logs = true;
  appConfig.log_date_format = 'YYYY-MM-DD HH:mm:ss Z';
}

module.exports = {
  apps: [appConfig],
};
