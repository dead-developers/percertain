import React from 'react';
import Split from 'split.js';
import { useEffect, useRef, useState } from 'react';

interface ResizableLayoutProps {
  children: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
  sizes?: number[];
  minSize?: number;
  className?: string;
}

export function ResizableLayout({
  children,
  direction = "horizontal",
  sizes = [50, 50],
  minSize = 100,
  className = "",
}: ResizableLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;
    
    // Don't initialize Split.js on mobile
    if (isMobile) return;

    const splitInstance = Split(
      Array.from(containerRef.current.children) as HTMLElement[],
      {
        sizes,
        minSize,
        direction,
        gutterSize: 6,
        gutterAlign: 'center',
        elementStyle: (dimension, size, gutterSize) => ({
          'flex-basis': `calc(${size}% - ${gutterSize}px)`,
        }),
        gutterStyle: (dimension, gutterSize) => ({
          'flex-basis': `${gutterSize}px`,
        }),
      }
    );

    return () => {
      splitInstance.destroy();
    };
  }, [mounted, direction, sizes, minSize, isMobile]);

  // On mobile, stack vertically regardless of direction
  if (mounted && isMobile) {
    return (
      <div className={`flex flex-col ${className}`}>
        {children.map((child, i) => (
          <div key={i} className="h-[50vh]">
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"} ${className}`}
    >
      {children.map((child, i) => (
        <div key={i} className="overflow-hidden">
          {child}
        </div>
      ))}
    </div>
  );
}
