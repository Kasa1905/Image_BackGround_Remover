import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api', uploadRouter);

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
