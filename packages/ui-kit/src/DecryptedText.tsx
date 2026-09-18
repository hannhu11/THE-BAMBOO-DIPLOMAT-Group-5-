import React, { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  characters?: string;
  revealDirection?: 'start' | 'end' | 'center';
  animateOnMount?: boolean;
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  className = '',
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  revealDirection = 'start',
  animateOnMount = true,
}) => {
  const [displayText, setDisplayText] = useState(animateOnMount ? '' : text);
  const [isDeciphering, setIsDeciphering] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (!text) return;
    setIsDeciphering(true);

    let iteration = 0;
    const textLength = text.length;

    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n') return char;

            let isRevealed = false;
            if (revealDirection === 'start') {
              isRevealed = index < (iteration / maxIterations) * textLength;
            } else if (revealDirection === 'end') {
              isRevealed = index >= textLength - (iteration / maxIterations) * textLength;
            } else {
              const center = textLength / 2;
              const dist = Math.abs(index - center);
              isRevealed = dist < (iteration / maxIterations) * (textLength / 2);
            }

            if (isRevealed) {
              return text[index];
            }

            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      iteration += 1;

      if (iteration >= maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsDeciphering(false);
      }
    }, speed);

    return () => clearInterval(intervalRef.current);
  }, [text, speed, maxIterations, characters, revealDirection]);

  return (
    <span className={`inline-block font-inherit ${className}`} data-deciphering={isDeciphering}>
      {displayText}
    </span>
  );
};
