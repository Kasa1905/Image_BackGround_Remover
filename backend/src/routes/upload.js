import express from 'express';
import multer from 'multer';
import { promises as fs } from 'fs';
import { extname } from 'path';
import { processImageLocal, processImageAPI } from '../services/processor.js';
import logger from '../utils/logger.js';

const router = express.Router();
const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';

// Ensure upload directory exists
await fs.mkdir(uploadDir, { recursive: true }).catch(() => { });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `upload-${uniqueSuffix}${extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/jpeg|jpg|png|webp/.test(file.mimetype)) cb(null, true);
        else cb(new Error('Invalid file type'));
    }
});

router.post('/remove-background', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ ok: false, error: 'No file uploaded' });

        const { mode = 'local', bg_color = 'transparent' } = req.body;
        logger.info('Processing', { filename: req.file.originalname, mode });

        let result;
        if (mode === 'local') result = await processImageLocal(req.file.path, bg_color);
        else result = await processImageAPI(req.file.path, 'removebg', bg_color);

        const imageBuffer = await fs.readFile(result.outputPath);

        // Cleanup
        await fs.unlink(req.file.path).catch(() => { });
        await fs.unlink(result.outputPath).catch(() => { });

        res.json({
            ok: true,
            data: imageBuffer.toString('base64'),
            mime: 'image/png'
        });
    } catch (error) {
        logger.error('Processing failed', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
