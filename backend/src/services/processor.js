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
    // Use relative path for python execution to avoid issues with spaces in directory names
    const pythonExecutable = './src/python/venv/bin/python';
    // We must pass the script path relative to the CWD as well or absolute (absolute is fine for script argument usually)
    // But let's be safe and use relative for script too if CWD is backend root
    const pythonScriptRel = './src/python/remove_bg.py';

    logger.info(`Spawning python: ${pythonExecutable} ${pythonScriptRel} in CWD: ${process.cwd()}`);

    return new Promise((resolve, reject) => {
        const args = ['--input', inputPath, '--output', outputPath];
        if (bgColor !== 'transparent') args.push('--bg_color', bgColor);

        const pythonProcess = spawn(pythonExecutable, [pythonScriptRel, ...args], {
            cwd: process.cwd(), // Ensure we are running from backend root
            shell: false // Don't use shell to avoid extra escaping needs, direct spawn is safer
        });

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
