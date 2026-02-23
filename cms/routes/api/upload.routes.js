import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Upload image via base64 to local storage
router.post('/upload', async (req, res) => {
  try {
    const { image, folder, filename } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Geen afbeelding meegegeven' });
    }

    // Extract base64 data (remove data:image/xxx;base64, prefix)
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Determine file extension from base64 prefix
    const matches = image.match(/^data:image\/(\w+);base64,/);
    const extension = matches ? matches[1] : 'jpg';
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../public/assets/images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const safeFilename = filename ? filename.replace(/[^a-z0-9.-]/gi, '_') : `upload-${timestamp}`;
    const finalFilename = safeFilename.endsWith(`.${extension}`) ? safeFilename : `${safeFilename}.${extension}`;
    const filepath = path.join(uploadsDir, finalFilename);

    // Write file
    fs.writeFileSync(filepath, base64Data, 'base64');

    // Generate relative URL
    const relativeUrl = `/cms/assets/images/${finalFilename}`;

    res.json({
      success: true,
      data: {
        url: relativeUrl,
        filename: finalFilename,
        path: filepath
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload mislukt: ' + error.message });
  }
});

export default router;
