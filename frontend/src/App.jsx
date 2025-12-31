import { useState, useEffect } from 'react';
import UploadForm from './components/UploadForm';
import ImageCompareSlider from './components/ImageCompareSlider';
import DownloadCard from './components/DownloadCard';
import ProTips from './components/ProTips';

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [processedImage, setProcessedImage] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const handleImageProcessed = (result) => setProcessedImage(result);

    const handleOriginalImage = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => setOriginalImage(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleReset = () => {
        setProcessedImage(null);
        setOriginalImage(null);
    };

    return (
        <div className="app">
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.1" />
                                <path d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="16" cy="16" r="4" fill="currentColor" />
                            </svg>
                            <h1>BG Removal</h1>
                        </div>
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    {!processedImage ? (
                        <>
                            <section className="hero">
                                <h2 className="hero-title">Remove Image Backgrounds <span className="gradient-text">Instantly</span></h2>
                                <p className="hero-subtitle">Professional background removal powered by AI. Free, fast, and completely private.</p>
                            </section>
                            <UploadForm onImageProcessed={handleImageProcessed} onOriginalImage={handleOriginalImage} />
                            <ProTips />
                        </>
                    ) : (
                        <>
                            <div className="success-animation">
                                <div className="confetti">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="confetti-piece" style={{
                                            left: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 0.5}s`,
                                            background: `hsl(${Math.random() * 360}, 70%, 60%)`
                                        }}></div>
                                    ))}
                                </div>
                            </div>
                            <section className="results">
                                <h2 className="results-title">✨ Background Removed Successfully!</h2>
                                {originalImage && (
                                    <ImageCompareSlider
                                        originalImage={originalImage}
                                        processedImage={`data:${processedImage.mime};base64,${processedImage.data}`}
                                    />
                                )}
                                <DownloadCard processedImage={processedImage} onReset={handleReset} />
                            </section>
                        </>
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>Built with ❤️ using <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">rembg</a></p>
                </div>
            </footer>
        </div>
    );
}

export default App;
