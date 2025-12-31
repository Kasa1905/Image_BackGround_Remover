import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../api/client';

const COLOR_PRESETS = [
    { name: 'Transparent', value: 'transparent' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' }
];

function UploadForm({ onImageProcessed, onOriginalImage }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [mode, setMode] = useState('local');
    const [bgColor, setBgColor] = useState('transparent');
    const [customColor, setCustomColor] = useState('#FFFFFF');

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.target === dropZoneRef.current) setIsDragging(false);
    };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files[0]) handleFileSelect(files[0]);
    };

    const handleFileSelect = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WEBP, or GIF)');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }
        setError(null);
        setSelectedFile(file);
        onOriginalImage(file);

        // Create preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
    };

    const handleBrowseClick = () => fileInputRef.current?.click();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setError('Please select an image first');

        setIsProcessing(true);
        setError(null);

        try {
            const finalBgColor = bgColor === 'custom' ? customColor : bgColor;
            const result = await uploadImage(selectedFile, { mode, bg_color: finalBgColor });
            onImageProcessed(result);
        } catch (err) {
            setError(err.message || 'Failed to process image');
            console.error('Upload error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return (
            <div className="processing">
                <div className="spinner" role="status"></div>
                <h3>Processing Your Image...</h3>
                <p>This may take a few moments</p>
                <div className="progress-bar"><div className="progress-fill"></div></div>
            </div>
        );
    }

    return (
        <form className="upload-form" onSubmit={handleSubmit}>
            <div
                ref={dropZoneRef}
                className={`upload-zone ${isDragging ? 'dragover' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                role="button"
                tabIndex={0}
            >
                {previewUrl ? (
                    <div className="image-preview">
                        <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                        <p className="mt-2">{selectedFile.name}</p>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">📁</div>
                        <h3>Drop your image here</h3>
                        <p>or click to browse</p>
                    </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} style={{ display: 'none' }} />
                {!selectedFile && <button type="button" className="btn">Choose Image</button>}
            </div>

            {error && <div className="error-message">{error}</div>}

            {selectedFile && (
                <div className="upload-options">
                    <div className="option-group">
                        <label>Processing Mode</label>
                        <div className="radio-group">
                            <div className="radio-option">
                                <input type="radio" id="mode-local" name="mode" value="local" checked={mode === 'local'} onChange={(e) => setMode(e.target.value)} />
                                <label htmlFor="mode-local">🖥️ Local (Free)</label>
                            </div>
                            <div className="radio-option">
                                <input type="radio" id="mode-api" name="mode" value="api" checked={mode === 'api'} onChange={(e) => setMode(e.target.value)} />
                                <label htmlFor="mode-api">☁️ API (Premium)</label>
                            </div>
                        </div>
                    </div>

                    <div className="option-group">
                        <label>Background Color</label>
                        <div className="color-picker-group">
                            <div className="color-presets">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        className={`color-preset ${bgColor === preset.value ? 'active' : ''}`}
                                        onClick={() => setBgColor(preset.value)}
                                    >
                                        <div className="color-swatch" style={{ backgroundColor: preset.value !== 'transparent' ? preset.value : undefined, backgroundImage: preset.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined, backgroundSize: '10px 10px' }} />
                                        {preset.name}
                                    </button>
                                ))}
                            </div>

                            <div className="custom-color-input">
                                <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setBgColor('custom'); }} />
                                <input type="text" value={bgColor === 'custom' ? customColor : bgColor} onChange={(e) => { setCustomColor(e.target.value); setBgColor('custom'); }} placeholder="#FFFFFF" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>✨ Remove Background</button>
                </div>
            )}
        </form>
    );
}

export default UploadForm;
