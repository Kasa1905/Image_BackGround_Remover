function DownloadCard({ processedImage, onReset }) {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:${processedImage.mime};base64,${processedImage.data}`;
        link.download = processedImage.filename || 'no-bg.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="download-card">
            <h3>🎉 Your Image is Ready!</h3>

            <div className="download-info">
                <div className="download-info-item">
                    <span className="download-info-label">Filename:</span>
                    <span className="download-info-value">{processedImage.filename}</span>
                </div>

                {processedImage.metadata && (
                    <>
                        <div className="download-info-item">
                            <span className="download-info-label">Original Size:</span>
                            <span className="download-info-value">{formatFileSize(processedImage.metadata.originalSize)}</span>
                        </div>

                        <div className="download-info-item">
                            <span className="download-info-label">Processed Size:</span>
                            <span className="download-info-value">{formatFileSize(processedImage.metadata.processedSize)}</span>
                        </div>

                        <div className="download-info-item">
                            <span className="download-info-label">Processing Mode:</span>
                            <span className="download-info-value">{processedImage.metadata.mode === 'local' ? '🖥️ Local' : '☁️ API'}</span>
                        </div>
                    </>
                )}

                {processedImage.processingTime && (
                    <div className="download-info-item">
                        <span className="download-info-label">Processing Time:</span>
                        <span className="download-info-value">{(processedImage.processingTime / 1000).toFixed(2)}s</span>
                    </div>
                )}
            </div>

            <div className="download-actions">
                <button className="btn" onClick={handleDownload}>⬇️ Download PNG</button>
                <button className="btn btn-secondary" onClick={onReset}>🔄 Try Another Image</button>
            </div>
        </div>
    );
}

export default DownloadCard;
