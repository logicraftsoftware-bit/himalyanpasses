import express from 'express';
import Package from '../models/Package.js';
import Category from '../models/Category.js';
import { adminAuth } from './middleware.js';
import { uploadPdfToCloudinary, uploadToCloudinary } from '../lib/cloudinary.js';

const router = express.Router();

// Helper to handle gallery uploads
const processGallery = async (gallery) => {
  if (!gallery || !Array.isArray(gallery)) return gallery;
  const uploadPromises = gallery.map(async (item) => {
    // Legacy support: if item is just a string and is base64
    if (typeof item === 'string' && item.startsWith('data:image/')) {
      try {
        const publicId = `packages/gallery_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const result = await uploadToCloudinary(item, publicId);
        return { url: result.secure_url, tab: '' };
      } catch (err) {
        console.error('Failed to upload image to Cloudinary:', err);
        return { url: item, tab: '' };
      }
    }
    
    // New structure: { url, tab }
    if (item && typeof item === 'object' && item.url && item.url.startsWith('data:image/')) {
      try {
        const publicId = `packages/gallery_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const result = await uploadToCloudinary(item.url, publicId);
        if (result && result.secure_url) {
          return { ...item, url: result.secure_url };
        }
        return item;
      } catch (err) {
        console.error('Failed to upload image to Cloudinary:', err);
        throw err;
      }
    }
    return item;
  });
  return await Promise.all(uploadPromises);
};

// Get all with pagination and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const query = {};

    if (search) {
      query.packageName = { $regex: search, $options: "i" };
    }

    if (category) {
      const cat = await Category.findById(category);
      if (cat) {
        query.$or = [
          { parentCategory: category },
          { _id: { $in: cat.packages || [] } }
        ];
      } else {
        query.parentCategory = category;
      }
    }

    const totalRecords = await Package.countDocuments(query);
    const packages = await Package.find(query)
      .populate('parentCategory')
      .populate('additionals')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: packages,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get grouped data for exploration
router.get('/grouped-data', async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).populate('parentCategory').populate('additionals');
    
    const organized = {
      bySeason: {},
      byMonth: {},
      byDuration: {},
      byDifficulty: {},
      byRegion: {}
    };

    packages.forEach(pkg => {
      // By Season (bestTime)
      if (pkg.bestTime) {
        const seasons = pkg.bestTime.split(',').map(s => s.trim()).filter(Boolean);
        seasons.forEach(s => {
          if (!organized.bySeason[s]) organized.bySeason[s] = [];
          organized.bySeason[s].push(pkg);
        });
      }

      // By Month (from departureDates)
      if (pkg.departureDates && pkg.departureDates.length > 0) {
        const months = [...new Set(pkg.departureDates.map(d => d.month))].filter(Boolean);
        months.forEach(m => {
          if (!organized.byMonth[m]) organized.byMonth[m] = [];
          organized.byMonth[m].push(pkg);
        });
      }

      // By Duration
      if (pkg.duration) {
        const dur = pkg.duration.trim();
        if (dur) {
          if (!organized.byDuration[dur]) organized.byDuration[dur] = [];
          organized.byDuration[dur].push(pkg);
        }
      }

      // By Difficulty
      if (pkg.difficulty) {
        const diff = pkg.difficulty.trim();
        if (diff) {
          if (!organized.byDifficulty[diff]) organized.byDifficulty[diff] = [];
          organized.byDifficulty[diff].push(pkg);
        }
      }

      // By Region
      if (pkg.region) {
        const reg = pkg.region.trim();
        if (reg) {
          if (!organized.byRegion[reg]) organized.byRegion[reg] = [];
          organized.byRegion[reg].push(pkg);
        }
      }
    });

    res.json(organized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    if (identifier === '0' || identifier === 'new') {
      return res.json({});
    }

    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a valid ObjectId
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const pkg = await Package.findOne(query)
      .populate('parentCategory')
      .populate('additionals');

    if (!pkg) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', adminAuth, async (req, res) => {
  try {
    const pkgData = { ...req.body };

    // Relaxed validation for initial creation to allow step-by-step saving
    if (!pkgData.packageName) {
      return res.status(400).json({ error: 'Package Name is required' });
    }
    if (!pkgData.slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }


    const existing = await Package.findOne({ slug: pkgData.slug });
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists. Please use a unique slug.' });
    }
    
    // Process PDF
    if (pkgData.itineraryPdfBase64 && pkgData.itineraryPdfBase64.startsWith('data:application/pdf;base64,')) {
      const publicId = `packages/pdf_${Date.now()}_${Math.round(Math.random() * 1e9)}.pdf`;
      const result = await uploadPdfToCloudinary(pkgData.itineraryPdfBase64, publicId);
      pkgData.itineraryPdf = result.secure_url;
    }
    delete pkgData.itineraryPdfBase64;

    // Process Thumbnail
    if (pkgData.thumbnailBase64 && pkgData.thumbnailBase64.startsWith('data:image/')) {
      const publicId = `packages/thumbnail_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      const result = await uploadToCloudinary(pkgData.thumbnailBase64, publicId);
      pkgData.thumbnail = result.secure_url;
    }
    delete pkgData.thumbnailBase64;
    
    // Process Gallery
    if (pkgData.gallery) {
      pkgData.gallery = await processGallery(pkgData.gallery);
    }

    if (!pkgData.parentCategory) delete pkgData.parentCategory;
    if (pkgData.additionals && Array.isArray(pkgData.additionals)) {
        pkgData.additionals = pkgData.additionals.filter(a => a);
    }
    
    const pkg = new Package(pkgData);
    await pkg.save();
    res.status(201).json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:identifier', adminAuth, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const pkgData = { ...req.body };
    delete pkgData._id; // Ensure we don't try to update the immutable _id
    
    // Process PDF
    if (pkgData.itineraryPdfBase64 && pkgData.itineraryPdfBase64.startsWith('data:application/pdf;base64,')) {
      const publicId = `packages/pdf_${Date.now()}_${Math.round(Math.random() * 1e9)}.pdf`;
      const result = await uploadPdfToCloudinary(pkgData.itineraryPdfBase64, publicId);
      pkgData.itineraryPdf = result.secure_url;
    }
    delete pkgData.itineraryPdfBase64;

    // Process Thumbnail
    if (pkgData.thumbnailBase64 && pkgData.thumbnailBase64.startsWith('data:image/')) {
      const publicId = `packages/thumbnail_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      const result = await uploadToCloudinary(pkgData.thumbnailBase64, publicId);
      pkgData.thumbnail = result.secure_url;
    }
    delete pkgData.thumbnailBase64;

    // Process Gallery
    if (pkgData.gallery) {
      pkgData.gallery = await processGallery(pkgData.gallery);
    }

    if (!pkgData.parentCategory) delete pkgData.parentCategory;
    if (pkgData.additionals && Array.isArray(pkgData.additionals)) {
        pkgData.additionals = pkgData.additionals.filter(a => a);
    }

    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }

    const pkg = await Package.findOneAndUpdate(query, pkgData, { new: true });
    if (!pkg) return res.status(404).json({ error: 'Not found' });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:identifier', adminAuth, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: identifier };
    } else {
      query = { slug: identifier };
    }
    await Package.findOneAndDelete(query);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
