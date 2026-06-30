import express from 'express';
import multer from 'multer';
import Setting from '../models/Setting.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import cloudinary from '../lib/cloudinary.js';
import { adminAuth } from './middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* GET Settings */
router.get('/', async (req, res) => {
  try {
    let setting = await Setting.findOne().lean();
    if (!setting) {
      const newSetting = new Setting();
      await newSetting.save();
      setting = newSetting.toObject();
    }
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE Settings */
router.put('/', adminAuth, upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    if (req.body.contactNumber && !/^[0-9]{10}$/.test(String(req.body.contactNumber))) {
      return res.status(400).json({ error: "Contact number must be 10 digits" });
    }
    if (req.body.whatsappNumber && !/^[0-9]{10}$/.test(String(req.body.whatsappNumber))) {
      return res.status(400).json({ error: "Whatsapp number must be 10 digits" });
    }

    if (req.body.contactNumber !== undefined) setting.contactNumber = req.body.contactNumber;
    if (req.body.whatsappNumber !== undefined) setting.whatsappNumber = req.body.whatsappNumber;
    if (req.body.emailId !== undefined) setting.emailId = req.body.emailId;
    if (req.body.address !== undefined) setting.address = req.body.address;
    if (req.body.mapIframe !== undefined) setting.mapIframe = req.body.mapIframe;

    // Handle social links and their files
    if (req.body.socialLinks) {
      try {
        const parsedLinks = JSON.parse(req.body.socialLinks);
        const updatedLinks = [];

        for (let i = 0; i < parsedLinks.length; i++) {
          const linkData = parsedLinks[i];
          let finalUrl = linkData.iconUrl || '';
          let finalPublicId = linkData.iconPublicId || '';

          const iconFile = files.find(f => f.fieldname === `socialIcon_${i}`);
          if (iconFile) {
            if (finalPublicId) {
              try {
                await cloudinary.uploader.destroy(finalPublicId);
              } catch (e) {}
            }

            const fileData = iconFile.buffer;
            const base64String = `data:${iconFile.mimetype};base64,${fileData.toString('base64')}`;
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const publicId = `settings/${uniqueSuffix}_socialIcon`;

            const uploadResult = await uploadToCloudinary(base64String, publicId);
            finalUrl = uploadResult.secure_url;
            finalPublicId = uploadResult.public_id;
          }

          updatedLinks.push({
            platform: linkData.platform,
            url: linkData.url,
            iconUrl: finalUrl,
            iconPublicId: finalPublicId
          });
        }

        setting.socialLinks = updatedLinks;
      } catch (e) {
        console.error('Failed to parse social links', e);
      }
    }

    // Handle logo upload
    const logoFile = files.find(f => f.fieldname === 'logo');
    if (logoFile) {
      if (setting.logoPublicId) {
        try {
          await cloudinary.uploader.destroy(setting.logoPublicId);
        } catch (e) {
          console.error('Failed to destroy old logo:', e);
        }
      }

      const fileData = logoFile.buffer;
      const base64String = `data:${logoFile.mimetype};base64,${fileData.toString('base64')}`;
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `settings/${uniqueSuffix}_logo`;

      const uploadResult = await uploadToCloudinary(base64String, publicId);
      setting.logoUrl = uploadResult.secure_url;
      setting.logoPublicId = uploadResult.public_id;
    }

    await setting.save();
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE Settings */
router.delete('/', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (setting) {
      if (setting.logoPublicId) {
        try {
          await cloudinary.uploader.destroy(setting.logoPublicId);
        } catch (e) {}
      }
      await Setting.deleteOne({ _id: setting._id });
    }
    res.json({ message: 'Settings cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;