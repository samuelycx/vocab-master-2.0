import { join } from 'path';

function resolveServerBase(cwd = process.cwd()) {
  if (cwd.endsWith('/server')) return cwd;
  return join(cwd, 'server');
}

export function resolveWebRootPath(cwd = process.cwd()) {
  const paths = [
    join(cwd, 'web', 'dist'),
    join(cwd, '..', 'web', 'dist'),
    join(__dirname, '..', '..', '..', 'web', 'dist'),
  ];
  const { existsSync } = require('fs');
  for (const p of paths) {
    if (existsSync(join(p, 'index.html'))) return p;
  }
  return paths[0];
}

export function resolveUploadsRootPath(cwd = process.cwd()) {
  const { mkdirSync } = require('fs');
  const resolved = join(resolveServerBase(cwd), 'uploads');
  mkdirSync(resolved, { recursive: true });
  return resolved;
}

export function createWebStaticOptions(cwd = process.cwd()) {
  return {
    rootPath: resolveWebRootPath(cwd),
    exclude: ['/api/{*any}', '/uploads/{*any}'],
  };
}

export function createUploadsStaticOptions(cwd = process.cwd()) {
  return {
    rootPath: resolveUploadsRootPath(cwd),
    serveRoot: '/uploads',
  };
}
