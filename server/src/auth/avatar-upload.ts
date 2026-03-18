import { mkdirSync } from 'fs';
import { randomBytes } from 'crypto';
import { extname, join } from 'path';
import { diskStorage } from 'multer';

function resolveServerRoot(cwd = process.cwd()) {
  return cwd.endsWith('/server') ? cwd : join(cwd, 'server');
}

export function resolveAvatarUploadDir(cwd = process.cwd()) {
  const dir = join(resolveServerRoot(cwd), 'uploads', 'avatars');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function buildAvatarPublicUrl(filename: string) {
  return `/uploads/avatars/${filename}`;
}

function buildAvatarFilename(originalName = 'avatar.png') {
  const extension = extname(originalName) || '.png';
  const suffix = randomBytes(6).toString('hex');
  return `${Date.now()}-${suffix}${extension}`;
}

export function createAvatarStorage() {
  return diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, resolveAvatarUploadDir());
    },
    filename: (_req: any, file: any, cb: any) => {
      cb(null, buildAvatarFilename(file?.originalname));
    },
  });
}

export function createAvatarUploadOptions() {
  return {
    storage: createAvatarStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowed = ['image/png', 'image/jpeg', 'image/webp'];
      cb(null, allowed.includes(file?.mimetype));
    },
  };
}
