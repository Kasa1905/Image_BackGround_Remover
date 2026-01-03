import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function processImageLocal(inputPath, bgColor = 'transparent') {
    const outputPath = inputPath.replace(/\.\w+$/, '-nobg.png');
    const defaultVenvPython = join(__dirname, '../python/venv/bin/python');

    let pythonExecutable = process.env.PYTHON_PATH;
    if (!pythonExecutable) {
        try {
            await fs.access(defaultVenvPython);
            pythonExecutable = defaultVenvPython;
        } catch {
            pythonExecutable = 'python3';
        }
    }

    const pythonScript = join(__dirname, '../python/remove_bg.py');
    logger.info(`Spawning python: ${pythonExecutable} ${pythonScript}`);

    return new Promise((resolve, reject) => {
        const args = [pythonScript, '--input', inputPath, '--output', outputPath];
        if (bgColor && bgColor !== 'transparent') args.push('--bg_color', bgColor);

        const pythonProcess = spawn(pythonExecutable, args, {
            cwd: process.cwd(),
            shell: false
        });

        let stderr = '';
        pythonProcess.stderr.on('data', d => stderr += d.toString());

        pythonProcess.on('close', code => {
            if (code === 0) resolve({ outputPath });
            else reject(new Error(`Python process failed (code ${code}): ${stderr || 'unknown error'}`));
        });

        pythonProcess.on('error', err => reject(new Error(`Failed to start python: ${err.message}`)));
    });
}

export async function processImageAPI(inputPath, provider = 'removebg', bgColor = 'transparent') {
    if (provider !== 'removebg') throw new Error('Only remove.bg provider is supported');

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) throw new Error('API Key missing');

    const outputPath = inputPath.replace(/\.\w+$/, '-nobg.png');
    const imageBuffer = await fs.readFile(inputPath);

    const formData = new FormData();
    formData.append('image_file', new Blob([imageBuffer]), 'upload.png');
    formData.append('size', 'auto');
    if (bgColor && bgColor !== 'transparent') formData.append('bg_color', bgColor.replace('#', ''));

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey },
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`remove.bg request failed (${response.status}): ${errorText || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(outputPath, buffer);
    return { outputPath };
}
