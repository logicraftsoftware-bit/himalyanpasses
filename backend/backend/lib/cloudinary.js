import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isBase64ImageString = (value) => {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();

  if (trimmed.startsWith('data:')) return true;
  if (/^https?:\/\//i.test(trimmed)) return false;
  if (trimmed.length < 50) return false;

  const cleaned = trimmed.replace(/\s+/g, '');
  return /^[A-Za-z0-9+/]+=*$/.test(cleaned);
};

export const normalizeBase64ImageString = (value, defaultMime = 'image/jpeg') => {
  if (!value || typeof value !== 'string') return value;

  const trimmed = value.trim();

  if (trimmed.startsWith('data:')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleaned = trimmed.replace(/\s+/g, '');
  if (!/^[A-Za-z0-9+/]+=*$/.test(cleaned)) return trimmed;

  let mime = defaultMime;

  if (cleaned.startsWith('/9j/')) mime = 'image/jpeg';
  else if (cleaned.startsWith('iVBOR')) mime = 'image/png';
  else if (cleaned.startsWith('R0lGOD')) mime = 'image/gif';
  else if (cleaned.startsWith('UklG')) mime = 'image/webp';

  return `data:${mime};base64,${cleaned}`;
};

// remove extension only from last part of path
const sanitizePublicId = (publicId = '') => {
  return String(publicId)
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .map((part, index, arr) => {
      if (index !== arr.length - 1) return part;
      return part.replace(/\.[^/.]+$/, '');
    })
    .join('/');
};

export const uploadToCloudinary = async (base64String, publicId) => {
  try {
    const normalized = normalizeBase64ImageString(base64String);
    const cleanPublicId = sanitizePublicId(publicId);

    const options = {
      public_id: cleanPublicId,
      overwrite: true,
      resource_type: 'image',
      format: 'webp',
    };

    const result = await cloudinary.uploader.upload(normalized, options);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const uploadPdfToCloudinary = async (base64String, publicId) => {
  try {
    const options = {
      public_id: publicId,
      overwrite: true,
      resource_type: 'raw',
    };
    const result = await cloudinary.uploader.upload(base64String, options);
    return result;
  } catch (error) {
    console.error('Cloudinary pdf upload error:', error);
    throw error;
  }
};

export default cloudinary;