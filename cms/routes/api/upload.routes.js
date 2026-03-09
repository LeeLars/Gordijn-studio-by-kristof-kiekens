import { Router } from 'express';
import cloudinary from '../../config/cloudinary.js';

const router = Router();

// Upload image via base64
router.post('/upload', async (req, res) => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Geen afbeelding meegegeven' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: folder || 'gordijnstudio',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload mislukt: ' + error.message });
  }
});

export default router;
