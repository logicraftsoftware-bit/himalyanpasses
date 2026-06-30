import express from 'express';
import multer from 'multer';
import AboutUs from '../models/AboutUs.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import cloudinary from '../lib/cloudinary.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 25 * 1024 * 1024 }
});

// GET About Us settings
router.get('/', async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne().lean();
    if (!aboutUs) {
      aboutUs = await AboutUs.create({});
    }
    res.json(aboutUs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) About Us settings
router.put('/', adminAuth, upload.array('images'), async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne();
    if (!aboutUs) {
      aboutUs = new AboutUs();
    }

    if (req.body.heading !== undefined) aboutUs.heading = req.body.heading;
    if (req.body.pageName !== undefined) aboutUs.pageName = req.body.pageName;
    if (req.body.slug !== undefined) aboutUs.slug = req.body.slug;
    if (req.body.metaTitle !== undefined) aboutUs.metaTitle = req.body.metaTitle;
    if (req.body.metaKeywords !== undefined) aboutUs.metaKeywords = req.body.metaKeywords;
    if (req.body.metaDescription !== undefined) aboutUs.metaDescription = req.body.metaDescription;

    if (req.body.content !== undefined) {
      aboutUs.content = req.body.content;
    }

    if (req.body.highlights !== undefined) {
      try {
        let parsedHighlights = JSON.parse(req.body.highlights);
        const newHighlightPublicIds = parsedHighlights.map(h => h.iconPublicId).filter(Boolean);
        const oldHighlightPublicIds = aboutUs.highlights.map(h => h.iconPublicId).filter(Boolean);
        const highlightsToDelete = oldHighlightPublicIds.filter(id => !newHighlightPublicIds.includes(id));

        for (const id of highlightsToDelete) {
          try {
            await cloudinary.uploader.destroy(id);
          } catch (e) {}
        }

        const uploadPromises = parsedHighlights.map(async (hl) => {
          if (hl.iconBase64) {
            if (hl.iconPublicId) {
              try {
                await cloudinary.uploader.destroy(hl.iconPublicId);
              } catch (e) {}
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const publicId = `aboutUs_icons/hl_${uniqueSuffix}`;
            const result = await uploadToCloudinary(hl.iconBase64, publicId);
            hl.iconUrl = result.secure_url;
            hl.iconPublicId = result.public_id;
            delete hl.iconBase64;
          }
          return hl;
        });

        aboutUs.highlights = await Promise.all(uploadPromises);
      } catch (e) {
        console.error('Highlights parse/upload error:', e);
      }
    }

    if (req.body.missionVision !== undefined) {
      try {
        let parsedMissionVision = JSON.parse(req.body.missionVision);
        const newMVPublicIds = parsedMissionVision.map(mv => mv.iconPublicId).filter(Boolean);
        const oldMVPublicIds = aboutUs.missionVision.map(mv => mv.iconPublicId).filter(Boolean);
        const mvToDelete = oldMVPublicIds.filter(id => !newMVPublicIds.includes(id));

        for (const id of mvToDelete) {
          try {
            await cloudinary.uploader.destroy(id);
          } catch (e) {}
        }

        const uploadPromisesMV = parsedMissionVision.map(async (mv) => {
          if (mv.iconBase64) {
            if (mv.iconPublicId) {
              try {
                await cloudinary.uploader.destroy(mv.iconPublicId);
              } catch (e) {}
            }
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const publicId = `aboutUs_icons/mv_${uniqueSuffix}`;
            const result = await uploadToCloudinary(mv.iconBase64, publicId);
            mv.iconUrl = result.secure_url;
            mv.iconPublicId = result.public_id;
            delete mv.iconBase64;
          }
          return mv;
        });

        aboutUs.missionVision = await Promise.all(uploadPromisesMV);
      } catch (e) {
        console.error('Mission/Vision parse/upload error:', e);
      }
    }

    let retainedImages = [];
    if (req.body.retainedImages !== undefined) {
      try {
        retainedImages = JSON.parse(req.body.retainedImages);
      } catch (e) {
        retainedImages = aboutUs.images;
      }
    } else {
      retainedImages = aboutUs.images;
    }

    const retainedPublicIds = retainedImages.map(img => img.publicId);
    const imagesToDelete = aboutUs.images.filter(img => !retainedPublicIds.includes(img.publicId));

    for (const img of imagesToDelete) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (cloudinaryErr) {
          console.error('Cloudinary delete err:', cloudinaryErr);
        }
      }
    }

    aboutUs.images = retainedImages;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileData = file.buffer;
        const base64String = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const publicId = `aboutUs/${uniqueSuffix}_${file.originalname.replace(/\s+/g, '_')}`;
        const result = await uploadToCloudinary(base64String, publicId);
        return {
          url: result.secure_url,
          publicId: result.public_id
        };
      });

      const newImages = await Promise.all(uploadPromises);
      aboutUs.images = [...aboutUs.images, ...newImages];
    }

    await aboutUs.save();
    res.json(aboutUs);
  } catch (err) {
    console.error('Update about us error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;