function ProTips() {
    const tips = [
        { icon: '📸', title: 'High Contrast', description: 'Images with clear subject-background separation work best' },
        { icon: '💡', title: 'Good Lighting', description: 'Well-lit photos produce more accurate results' },
        { icon: '📏', title: 'Optimal Size', description: 'Resize large images to 1920x1080 for faster processing' },
        { icon: '🎯', title: 'Single Subject', description: 'Works best with one main subject in the foreground' },
        { icon: '🔒', title: 'Privacy First', description: 'Local mode keeps your images on your device' },
        { icon: '⚡', title: 'Fast & Free', description: 'Local processing is unlimited and completely free' }
    ];

    return (
        <div className="pro-tips">
            <h3><span>💡</span> Pro Tips for Better Results</h3>
            <div className="tips-grid">
                {tips.map((tip, index) => (
                    <div key={index} className="tip-item">
                        <div className="tip-icon">{tip.icon}</div>
                        <div className="tip-content">
                            <h4>{tip.title}</h4>
                            <p>{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProTips;
