import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all blogs (with pagination and filters)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { search, category, tag, active } = req.query;

    let query = {};
    
    // For admin dashboard, we might want to see all blogs. 
    // If 'active' query is provided, filter by it. Otherwise, return all.
    if (active !== undefined) {
      query.active = active === 'true';
    }

    if (search) {
      query.heading = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent blogs (e.g. limit to top 3 or 5)
router.get('/recent/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const blogs = await Blog.find({ active: true }).populate('category').sort({ createdAt: -1 }).limit(limit);
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unique tags
router.get('/tags', async (req, res) => {
  try {
    const tags = await Blog.distinct('tags');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get blogs by category
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const category = await BlogCategory.findOne({ slug });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const total = await Blog.countDocuments({ category: category._id, active: true });
    const blogs = await Blog.find({ category: category._id, active: true })
      .populate('category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single blog
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('category');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a blog
const cpUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 }
]);

router.post('/', adminAuth, cpUpload, async (req, res) => {
  try {
    const { 
      heading, content, active, category, tags, publishDate,
      metaTitle, metaKeywords, metaDescription 
    } = req.body;

    const slugify = (text) => {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    };

    const categoryArray = Array.isArray(category) ? category : (category ? [category] : []);
    const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);

    const blogData = { 
      heading, content, active: active !== undefined ? active !== 'false' : true, 
      category: categoryArray,
      tags: tagsArray,
      publishDate: publishDate || new Date(),
      slug: req.body.slug ? slugify(req.body.slug) : slugify(heading), 
      metaTitle, metaKeywords, metaDescription
    };

    const processUpload = async (fileArray) => {
      if (!fileArray || fileArray.length === 0) return null;
      const file = fileArray[0];
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `blogs/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
      const result = await uploadToCloudinary(base64String, publicId);
      return { url: result.secure_url, publicId: result.public_id };
    };

    if (req.files) {
      if (req.files.thumbnail) blogData.thumbnail = await processUpload(req.files.thumbnail);
      if (req.files.image1) blogData.image1 = await processUpload(req.files.image1);
      if (req.files.image2) blogData.image2 = await processUpload(req.files.image2);
      if (req.files.image3) blogData.image3 = await processUpload(req.files.image3);
    }

    const blog = new Blog(blogData);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a blog
router.put('/:id', adminAuth, cpUpload, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const slugify = (text) => {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    };

    if (req.body.slug !== undefined) {
      blog.slug = slugify(req.body.slug);
    } else if (req.body.heading !== undefined) {
      blog.slug = slugify(req.body.heading);
    }

    if (req.body.heading !== undefined) {
      blog.heading = req.body.heading;
    }
    if (req.body.category !== undefined) {
      const category = req.body.category;
      blog.category = Array.isArray(category) ? category : (category ? [category] : []);
    }
    if (req.body.tags !== undefined) {
      const tags = req.body.tags;
      blog.tags = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    }
    if (req.body.content !== undefined) blog.content = req.body.content;
    if (req.body.active !== undefined) blog.active = req.body.active !== 'false';
    if (req.body.metaTitle !== undefined) blog.metaTitle = req.body.metaTitle;
    if (req.body.metaKeywords !== undefined) blog.metaKeywords = req.body.metaKeywords;
    if (req.body.metaDescription !== undefined) blog.metaDescription = req.body.metaDescription;
    if (req.body.publishDate !== undefined) blog.publishDate = req.body.publishDate;

    const processUpload = async (fileArray, oldImageData) => {
      if (!fileArray || fileArray.length === 0) return oldImageData;
      const file = fileArray[0];
      
      // Delete old image if it exists
      if (oldImageData && oldImageData.publicId) {
        await cloudinary.uploader.destroy(oldImageData.publicId);
      }

      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `blogs/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
      const result = await uploadToCloudinary(base64String, publicId);
      return { url: result.secure_url, publicId: result.public_id };
    };

    if (req.files) {
      if (req.files.thumbnail) blog.thumbnail = await processUpload(req.files.thumbnail, blog.thumbnail);
      if (req.files.image1) blog.image1 = await processUpload(req.files.image1, blog.image1);
      if (req.files.image2) blog.image2 = await processUpload(req.files.image2, blog.image2);
      if (req.files.image3) blog.image3 = await processUpload(req.files.image3, blog.image3);
    }

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    const deleteImage = async (imageData) => {
      if (imageData && imageData.publicId) {
        try {
          await cloudinary.uploader.destroy(imageData.publicId);
        } catch (e) {
          console.error("Cloudinary delete err:", e);
        }
      }
    };

    await deleteImage(blog.thumbnail);
    await deleteImage(blog.image1);
    await deleteImage(blog.image2);
    await deleteImage(blog.image3);

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
