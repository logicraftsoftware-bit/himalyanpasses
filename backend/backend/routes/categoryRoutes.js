import express from 'express';
import Category from '../models/Category.js';
import Package from '../models/Package.js';
import { adminAuth } from './middleware.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';

const router = express.Router();

// Helper to handle banner uploads
const processBanners = async (banners) => {
  if (!banners || !Array.isArray(banners)) return banners;
  const uploadPromises = banners.map(async (item) => {
    if (typeof item === 'string' && item.startsWith('data:image/')) {
      try {
        const publicId = `categories/banner_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const result = await uploadToCloudinary(item, publicId);
        if (result && result.secure_url) {
          return result.secure_url;
        }
        console.error('Cloudinary banner upload success but no secure_url:', result);
        return item;
      } catch (err) {
        console.error('Failed to upload category banner to Cloudinary:', err);
        throw err;
      }
    }
    return item;
  });
  return await Promise.all(uploadPromises);
};

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate({
        path: 'packages',
        select: 'slug -_id'
      })
      .sort({ createdAt: -1 })
      .lean();

    const result = categories.map(category => ({
      ...category,
      packages: category.packages.map(pkg => pkg.slug)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get single by ID or Slug
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;

    if (identifier === '0' || identifier === 'new') {
      return res.json({});
    }

    let query = {};
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const category = await Category.findOne(query)
      .populate({
        path: 'packages',
        select: 'slug -_id'
      })
      .lean();

    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    category.packages = category.packages.map(pkg => pkg.slug);

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const categoryData = { ...req.body };
    if (categoryData.bannerItems) {
      categoryData.bannerItems = await processBanners(categoryData.bannerItems);
    }
    const category = new Category(categoryData);
    await category.save();

    if (category.packages && category.packages.length > 0) {
      await Package.updateMany(
        { _id: { $in: category.packages } },
        { parentCategory: category._id }
      );
    }

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:identifier', adminAuth, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const categoryData = { ...req.body };
    delete categoryData._id;

    if (categoryData.bannerItems) {
      categoryData.bannerItems = await processBanners(categoryData.bannerItems);
    }

    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const category = await Category.findOneAndUpdate(query, categoryData, { new: true });
    if (category) {
      if (category.packages && category.packages.length > 0) {
        await Package.updateMany(
          { _id: { $in: category.packages } },
          { parentCategory: category._id }
        );
      }
      await Package.updateMany(
        {
          parentCategory: category._id,
          _id: { $nin: category.packages || [] }
        },
        { $unset: { parentCategory: "" } }
      );
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:identifier', adminAuth, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }
    const category = await Category.findOneAndDelete(query);
    if (category) {
      await Package.updateMany(
        { parentCategory: category._id },
        { $unset: { parentCategory: "" } }
      );
    }
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
