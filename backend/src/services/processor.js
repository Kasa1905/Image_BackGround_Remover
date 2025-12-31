import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function processImageLocal(inputPath, bgColor = 'transparent') {
    const outputPath = inputPath.replace(/\.\w+$/, '-nobg.png');
    // Use the virtual environment python
    const venvPython = join(__dirname, '../python/venv/bin/python');
    const pythonScript = join(__dirname, '../python/remove_bg.py');

    // Force usage of venv python
    const pythonExecutable = venvPython;
    logger.info(`Using python executable: ${pythonExecutable}`);

    return new Promise((resolve, reject) => {
        const args = ['--input', inputPath, '--output', outputPath];
        if (bgColor !== 'transparent') args.push('--bg_color', bgColor);

        const pythonProcess = spawn(pythonExecutable, [pythonScript, ...args]);

        let stderr = '';
        pythonProcess.stderr.on('data', d => stderr += d);

        pythonProcess.on('close', code => {
            if (code === 0) resolve({ outputPath });
            else reject(new Error(`Python process failed: ${stderr}`));
        });
    });
}

export async function processImageAPI(inputPath, provider, bgColor = 'transparent') {
    // Simplified for brevity, reusing the logic from reference
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) throw new Error('API Key missing');

    const outputPath = inputPath.replace(/\.\w+$/, '-nobg.png');
    const imageBuffer = await fs.readFile(inputPath);
    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]));
    formData.append('size', 'auto');
    if (bgColor !== 'transparent') formData.append('bg_color', bgColor);

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
        headers: { 'X-Api-Key': apiKey },
        responseType: 'arraybuffer'
    });

    await fs.writeFile(outputPath, response.data);
    return { outputPath };
}
