import { useState, useEffect } from 'react';

const TypeWriter = ({ text, speed = 100, mode = "fast", delay = 500, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (!text) return;

        setDisplayedText('');
        setIsComplete(false);

        if (mode === "streaming") {
            // Normal typewriter effect
            let index = 0;
            const timer = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.slice(0, index + 1));
                    index++;
                } else {
                    setIsComplete(true);
                    clearInterval(timer);
                    onComplete?.();
                }
            }, speed);

            return () => clearInterval(timer);
        } else if (mode === "fast") {
            // Show full text instantly
            setDisplayedText(text);

            // Blink cursor for fake streaming
            const timer = setTimeout(() => {
                setIsComplete(true);
                setShowCursor(false);
                onComplete?.();
            }, delay);

            const blink = setInterval(() => {
                setShowCursor((prev) => !prev);
            }, 400);

            return () => {
                clearTimeout(timer);
                clearInterval(blink);
            };
        }
    }, [text, speed, mode, delay, onComplete]);

    return (
        <span>
      {displayedText}
            {!isComplete && showCursor && (
                <span className="inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse" />
            )}
    </span>
    );
};

export default TypeWriter;
