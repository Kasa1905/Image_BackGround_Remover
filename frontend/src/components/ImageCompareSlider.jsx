import { useState, useRef, useEffect } from 'react';

function ImageCompareSlider({ originalImage, processedImage }) {
    const [position, setPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setPosition(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        const handleGlobalMouseMove = (e) => {
            if (isDragging) handleMove(e.clientX);
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mousemove', handleGlobalMouseMove);
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [isDragging]);

    return (
        <div className="image-compare">
            <div
                ref={containerRef}
                className="image-compare-container"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                style={{ '--position': `${position}%` }}
                role="img"
                aria-label="Image comparison slider"
            >
                <img src={processedImage} alt="Processed" className="image-before" />
                <img src={originalImage} alt="Original" className="image-after" />

                <div
                    className="slider-handle"
                    onMouseDown={handleMouseDown}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={() => setIsDragging(false)}
                    role="slider"
                    aria-valuenow={position}
                    tabIndex={0}
                />

                <div className="image-labels">
                    <span className="image-label">Before</span>
                    <span className="image-label">After</span>
                </div>
            </div>
        </div>
    );
}

export default ImageCompareSlider;
