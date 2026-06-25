"use client";

import { useEffect, useState } from "react";

export function PlayfulCat() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [catPos, setCatPos] = useState({ x: -100, y: -100 });
  const [isMoving, setIsMoving] = useState(false);

  // Track mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Cat follows mouse with delay
  useEffect(() => {
    let animationFrameId: number;
    let movingTimeout: NodeJS.Timeout;

    const followMouse = () => {
      setCatPos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 40) {
          setIsMoving(true);
          clearTimeout(movingTimeout);
          movingTimeout = setTimeout(() => setIsMoving(false), 150);
          
          // Easing: move a percentage of the remaining distance per frame
          return {
            x: prev.x + dx * 0.06,
            y: prev.y + dy * 0.06,
          };
        }
        return prev;
      });
      animationFrameId = requestAnimationFrame(followMouse);
    };

    animationFrameId = requestAnimationFrame(followMouse);
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(movingTimeout);
    };
  }, [mousePos]);

  const dx = mousePos.x - catPos.x;
  const isFacingLeft = dx < 0;

  // Don't render if it hasn't found the mouse yet
  if (catPos.x === -100 && catPos.y === -100) return null;

  return (
    <div
      className="pointer-events-none fixed z-[100]"
      style={{
        left: catPos.x,
        top: catPos.y,
        // Offset so it chases slightly behind/below the cursor
        transform: 'translate(15px, 15px)' 
      }}
    >
      <div 
        className="text-[40px] drop-shadow-md transition-transform duration-150"
        style={{
          transform: `scaleX(${isFacingLeft ? -1 : 1})`,
        }}
      >
        <div className={`${isMoving ? 'animate-bounce' : ''}`}>
          🐈
        </div>
      </div>
    </div>
  );
}
