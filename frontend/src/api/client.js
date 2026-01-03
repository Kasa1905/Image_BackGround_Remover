const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function uploadImage(file, options = {}) {
    const formData = new FormData();
    formData.append('image', file);

    if (options.mode) formData.append('mode', options.mode);
    if (options.bg_color) formData.append('bg_color', options.bg_color);
    if (options.api_provider) formData.append('api_provider', options.api_provider);

    try {
        const response = await fetch(`${API_BASE_URL}/api/remove-background`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || `HTTP error! status: ${response.status}`);
        if (!data.ok) throw new Error(data.error || 'Failed to process image');

        return data;
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to server. Please ensure the backend is running.');
        }
        throw error;
    }
}

export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        throw new Error('Backend server is not responding');
    }
}

export function downloadImage(base64Data, filename = 'image.png', mime = 'image/png') {
    const link = document.createElement('a');
    link.href = `data:${mime};base64,${base64Data}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default { uploadImage, checkHealth, downloadImage };
