import { Router } from 'express';
import cloudinary from '../../config/cloudinary.js';

const router = Router();

// Get all library images
router.get('/library', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'gordijnstudio/library/',
      max_results: 100,
      context: true
    });

    const images = result.resources.map(resource => ({
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail: cloudinary.url(resource.public_id, {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto:good',
        fetch_format: 'auto'
      }),
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at
    }));

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Library fetch error:', error);
    res.status(500).json({ success: false, error: 'Kan bibliotheek niet laden' });
  }
});

// Upload image to library
router.post('/library/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Geen afbeelding meegegeven' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'gordijnstudio/library',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    res.json({
      success: true,
      data: {
        id: result.public_id,
        url: result.secure_url,
        thumbnail: cloudinary.url(result.public_id, {
          width: 300,
          height: 300,
          crop: 'fill',
          quality: 'auto:good',
          fetch_format: 'auto'
        }),
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Library upload error:', error);
    res.status(500).json({ success: false, error: 'Upload mislukt: ' + error.message });
  }
});

// Delete image from library
router.delete('/library/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await cloudinary.uploader.destroy(id);

    res.json({
      success: true,
      message: 'Afbeelding verwijderd'
    });
  } catch (error) {
    console.error('Library delete error:', error);
    res.status(500).json({ success: false, error: 'Verwijderen mislukt: ' + error.message });
  }
});

export default router;
