const fs = require('fs');
const path = require('path');

/**
 * Reusable file storage utilities for saving and serving uploaded files
 */
class FileStorageService {
  static UPLOAD_DIR = 'uploads';
  static MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

  /** Initialize upload directory with common subdirectories */
  static initializeUploadDirectory() {
    const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const subdirs = ['passports', 'flags', 'documents', 'photos'];
    subdirs.forEach((subdir) => {
      const subdirPath = path.join(uploadPath, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    });
  }

  /** Basic file validation */
  static validateFile(file) {
    if (!file) return { isValid: false, error: 'No file provided' };
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${this.ALLOWED_IMAGE_TYPES.join(', ')}`,
      };
    }
    return { isValid: true };
  }

  /** Generate unique filename */
  static generateFilename(originalName, fileType, userId, appId) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName || '');
    const safeType = fileType || 'document';
    const safeUser = userId || 'public';
    const parts = [safeType, safeUser, timestamp, randomSuffix]
      .filter(Boolean)
      .map(String);
    if (appId) {
      parts.splice(1, 0, appId);
    }
    return `${parts.join('_')}${extension}`;
  }

  /** Save file buffer to disk */
  static async saveFile(file, fileType, userId, appId) {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const filename = this.generateFilename(file.originalName || file.originalname, fileType, userId, appId);
    const subdir = fileType === 'passport' ? 'passports' : fileType === 'photo' ? 'photos' : 'documents';
    const uploadPath = path.join(process.cwd(), this.UPLOAD_DIR, subdir);
    const filepath = path.join(uploadPath, filename);
    const relativePath = path.join(this.UPLOAD_DIR, subdir, filename);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const buffer = file.buffer || file.data;
    await fs.promises.writeFile(filepath, buffer);

    return {
      filename,
      filepath,
      relativePath,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
  }

  /** Delete file from server (expects path relative to project root or absolute) */
  static async deleteFile(filepath) {
    try {
      const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }

  /** Build URL path that can be directly used by clients */
  static getFileUrl(relativePath, baseUrl = '') {
    const normalized = `/${String(relativePath || '')}`.replace(/\\/g, '/').replace(/\/+/, '/');
    if (!baseUrl) return normalized;
    const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${trimmedBase}${normalized}`;
  }

  /** Check if file exists */
  static fileExists(filepath) {
    const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
    return fs.existsSync(fullPath);
  }

  /** Get file stats */
  static async getFileStats(filepath) {
    try {
      const fullPath = path.isAbsolute(filepath) ? filepath : path.join(process.cwd(), filepath);
      return await fs.promises.stat(fullPath);
    } catch (err) {
      return null;
    }
  }
}

module.exports = { FileStorageService };


