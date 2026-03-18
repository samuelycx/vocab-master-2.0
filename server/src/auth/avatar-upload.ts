import { mkdirSync, rmSync } from 'fs';
import { randomBytes } from 'crypto';
import { basename, extname, join } from 'path';
import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

export const AVATAR_MAX_FILE_SIZE = 2 * 1024 * 1024;

const AVATAR_MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

const AVATAR_EXTENSION_MIME_MAP: Record<string, string[]> = {
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.webp': ['image/webp'],
};

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

export function resolveAvatarExtension(file: { mimetype?: string; originalname?: string } = {}) {
  const targetExtension = AVATAR_MIME_EXTENSION_MAP[file.mimetype || ''];
  if (!targetExtension) {
    throw new BadRequestException('Unsupported avatar file type');
  }

  const originalExtension = extname(String(file.originalname || '')).toLowerCase();
  const allowedMimeTypes = AVATAR_EXTENSION_MIME_MAP[originalExtension];
  if (!originalExtension || !allowedMimeTypes?.includes(file.mimetype || '')) {
    throw new BadRequestException('Avatar file extension does not match MIME type');
  }

  return targetExtension;
}

function buildAvatarFilename(file: { mimetype?: string; originalname?: string } = {}) {
  const extension = resolveAvatarExtension(file);
  const suffix = randomBytes(6).toString('hex');
  return `${Date.now()}-${suffix}${extension}`;
}

export function resolveAvatarFilePathFromPublicUrl(publicUrl?: string, cwd = process.cwd()) {
  const normalizedUrl = String(publicUrl || '').trim();
  if (!normalizedUrl.startsWith('/uploads/avatars/')) {
    return null;
  }

  const filename = normalizedUrl.slice('/uploads/avatars/'.length);
  if (!filename || basename(filename) !== filename) {
    return null;
  }

  return join(resolveAvatarUploadDir(cwd), filename);
}

export function removeAvatarFile(publicUrl?: string, cwd = process.cwd()) {
  const filePath = resolveAvatarFilePathFromPublicUrl(publicUrl, cwd);
  if (!filePath) {
    return;
  }
  rmSync(filePath, { force: true });
}

export function createAvatarStorage() {
  return diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, resolveAvatarUploadDir());
    },
    filename: (_req: any, file: any, cb: any) => {
      try {
        cb(null, buildAvatarFilename(file));
      } catch (error) {
        cb(error, '');
      }
    },
  });
}

export function createAvatarUploadOptions() {
  return {
    storage: createAvatarStorage(),
    limits: { fileSize: AVATAR_MAX_FILE_SIZE },
    fileFilter: (_req: any, file: any, cb: any) => {
      try {
        resolveAvatarExtension(file);
        cb(null, true);
      } catch (error) {
        cb(error, false);
      }
    },
  };
}
