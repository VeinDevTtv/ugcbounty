"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isInModal, setIsInModal] = useState(false);
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const magneticOffsetRef = useRef({ x: 0, y: 0 });
  const cursorPathRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);

  // Smooth spring animations for cursor position
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Create all particle motion values and springs at top level (must be before any conditional returns)
  const particle1X = useMotionValue(0);
  const particle1Y = useMotionValue(0);
  const particle1XSpring = useSpring(particle1X, { damping: 20, stiffness: 200, mass: 0.3 });
  const particle1YSpring = useSpring(particle1Y, { damping: 20, stiffness: 200, mass: 0.3 });

  const particle2X = useMotionValue(0);
  const particle2Y = useMotionValue(0);
  const particle2XSpring = useSpring(particle2X, { damping: 20, stiffness: 200, mass: 0.3 });
  const particle2YSpring = useSpring(particle2Y, { damping: 20, stiffness: 200, mass: 0.3 });

  const particle3X = useMotionValue(0);
  const particle3Y = useMotionValue(0);
  const particle3XSpring = useSpring(particle3X, { damping: 20, stiffness: 200, mass: 0.3 });
  const particle3YSpring = useSpring(particle3Y, { damping: 20, stiffness: 200, mass: 0.3 });

  const particle4X = useMotionValue(0);
  const particle4Y = useMotionValue(0);
  const particle4XSpring = useSpring(particle4X, { damping: 20, stiffness: 200, mass: 0.3 });
  const particle4YSpring = useSpring(particle4Y, { damping: 20, stiffness: 200, mass: 0.3 });

  // Sparkle particles - create motion values and springs for sparkles (trailing line)
  const sparkle1X = useMotionValue(0);
  const sparkle1Y = useMotionValue(0);
  const sparkle1XSpring = useSpring(sparkle1X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle1YSpring = useSpring(sparkle1Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle2X = useMotionValue(0);
  const sparkle2Y = useMotionValue(0);
  const sparkle2XSpring = useSpring(sparkle2X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle2YSpring = useSpring(sparkle2Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle3X = useMotionValue(0);
  const sparkle3Y = useMotionValue(0);
  const sparkle3XSpring = useSpring(sparkle3X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle3YSpring = useSpring(sparkle3Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle4X = useMotionValue(0);
  const sparkle4Y = useMotionValue(0);
  const sparkle4XSpring = useSpring(sparkle4X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle4YSpring = useSpring(sparkle4Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle5X = useMotionValue(0);
  const sparkle5Y = useMotionValue(0);
  const sparkle5XSpring = useSpring(sparkle5X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle5YSpring = useSpring(sparkle5Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle6X = useMotionValue(0);
  const sparkle6Y = useMotionValue(0);
  const sparkle6XSpring = useSpring(sparkle6X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle6YSpring = useSpring(sparkle6Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle7X = useMotionValue(0);
  const sparkle7Y = useMotionValue(0);
  const sparkle7XSpring = useSpring(sparkle7X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle7YSpring = useSpring(sparkle7Y, { damping: 15, stiffness: 150, mass: 0.2 });
  
  const sparkle8X = useMotionValue(0);
  const sparkle8Y = useMotionValue(0);
  const sparkle8XSpring = useSpring(sparkle8X, { damping: 15, stiffness: 150, mass: 0.2 });
  const sparkle8YSpring = useSpring(sparkle8Y, { damping: 15, stiffness: 150, mass: 0.2 });

  // Array of particles for easier iteration - memoized to prevent recreation
  const particles = useMemo(
    () => [
      { x: particle1X, y: particle1Y, xSpring: particle1XSpring, ySpring: particle1YSpring },
      { x: particle2X, y: particle2Y, xSpring: particle2XSpring, ySpring: particle2YSpring },
      { x: particle3X, y: particle3Y, xSpring: particle3XSpring, ySpring: particle3YSpring },
      { x: particle4X, y: particle4Y, xSpring: particle4XSpring, ySpring: particle4YSpring },
    ],
    [
      particle1X,
      particle1Y,
      particle1XSpring,
      particle1YSpring,
      particle2X,
      particle2Y,
      particle2XSpring,
      particle2YSpring,
      particle3X,
      particle3Y,
      particle3XSpring,
      particle3YSpring,
      particle4X,
      particle4Y,
      particle4XSpring,
      particle4YSpring,
    ]
  );

  // Sparkles array - memoized (for trailing line effect)
  const sparkles = useMemo(
    () => [
      { x: sparkle1X, y: sparkle1Y, xSpring: sparkle1XSpring, ySpring: sparkle1YSpring, delay: 0 },
      { x: sparkle2X, y: sparkle2Y, xSpring: sparkle2XSpring, ySpring: sparkle2YSpring, delay: 0.1 },
      { x: sparkle3X, y: sparkle3Y, xSpring: sparkle3XSpring, ySpring: sparkle3YSpring, delay: 0.2 },
      { x: sparkle4X, y: sparkle4Y, xSpring: sparkle4XSpring, ySpring: sparkle4YSpring, delay: 0.3 },
      { x: sparkle5X, y: sparkle5Y, xSpring: sparkle5XSpring, ySpring: sparkle5YSpring, delay: 0.4 },
      { x: sparkle6X, y: sparkle6Y, xSpring: sparkle6XSpring, ySpring: sparkle6YSpring, delay: 0.5 },
      { x: sparkle7X, y: sparkle7Y, xSpring: sparkle7XSpring, ySpring: sparkle7YSpring, delay: 0.6 },
      { x: sparkle8X, y: sparkle8Y, xSpring: sparkle8XSpring, ySpring: sparkle8YSpring, delay: 0.7 },
    ],
    [
      sparkle1X,
      sparkle1Y,
      sparkle1XSpring,
      sparkle1YSpring,
      sparkle2X,
      sparkle2Y,
      sparkle2XSpring,
      sparkle2YSpring,
      sparkle3X,
      sparkle3Y,
      sparkle3XSpring,
      sparkle3YSpring,
      sparkle4X,
      sparkle4Y,
      sparkle4XSpring,
      sparkle4YSpring,
      sparkle5X,
      sparkle5Y,
      sparkle5XSpring,
      sparkle5YSpring,
      sparkle6X,
      sparkle6Y,
      sparkle6XSpring,
      sparkle6YSpring,
      sparkle7X,
      sparkle7Y,
      sparkle7XSpring,
      sparkle7YSpring,
      sparkle8X,
      sparkle8Y,
      sparkle8XSpring,
      sparkle8YSpring,
    ]
  );

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    // Use callback to avoid synchronous setState
    const updateReducedMotion = () => {
      setIsReducedMotion(mediaQuery.matches);
    };
    
    // Initial check in next tick
    updateReducedMotion();

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Check if device is touch-enabled
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is IE-specific
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Check if cursor is over a modal/menu
  const checkIfInModal = useCallback((x: number, y: number): boolean => {
    const element = document.elementFromPoint(x, y);
    if (!element) return false;

    // Check if element or any parent has high z-index (modals typically have z-50+)
    let current: Element | null = element;
    while (current) {
      const style = window.getComputedStyle(current);
      const zIndex = parseInt(style.zIndex, 10);
      
      // Check for modal indicators
      if (
        zIndex >= 50 ||
        current.hasAttribute('data-modal') ||
        current.hasAttribute('data-clerk-modal') ||
        current.classList.contains('cl-modal') ||
        current.closest('[data-modal]') ||
        current.closest('[data-clerk-modal]') ||
        current.closest('[class*="clerk"]') ||
        current.closest('[class*="cl-rootBox"]') ||
        current.closest('[class*="cl-modalContent"]')
      ) {
        return true;
      }
      
      current = current.parentElement;
    }
    
    return false;
  }, []);

  // Mouse move handler with throttling
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const inModal = checkIfInModal(e.clientX, e.clientY);
      setIsInModal(inModal);
      
      // Always show cursor when in modal, or when moving
      if (!isVisible || inModal) setIsVisible(true);

      let x = e.clientX;
      let y = e.clientY;

      // Apply magnetic effect if hovering
      if (isHovering && hoveredElementRef.current) {
        const rect = hoveredElementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = centerX - x;
        const distanceY = centerY - y;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        const maxDistance = 100;
        const pullStrength = Math.max(0, 1 - distance / maxDistance) * 8;

        magneticOffsetRef.current = {
          x: distanceX * 0.1 * pullStrength,
          y: distanceY * 0.1 * pullStrength,
        };

        x += magneticOffsetRef.current.x;
        y += magneticOffsetRef.current.y;
      } else {
        magneticOffsetRef.current = { x: 0, y: 0 };
      }

      cursorX.set(x);
      cursorY.set(y);

      // Store cursor path for sparkle trail
      const now = Date.now();
      cursorPathRef.current.push({ x, y, timestamp: now });
      
      // Keep only recent positions (last 500ms)
      cursorPathRef.current = cursorPathRef.current.filter(
        (point) => now - point.timestamp < 500
      );

      // Update trailing particles with delay
      particles.forEach((particle, index) => {
        setTimeout(() => {
          particle.x.set(x);
          particle.y.set(y);
        }, index * 10);
      });

      // Update sparkles to follow cursor path as a smooth trailing line
      const path = cursorPathRef.current;
      if (path.length > 1) {
        sparkles.forEach((sparkle) => {
          // Calculate position along the path based on delay
          const delayMs = sparkle.delay * 100; // Convert delay to milliseconds
          const targetTime = now - delayMs;
          
          // Find the two points in the path that bracket the target time
          let point1 = path[0];
          let point2 = path[1];
          
          for (let i = 0; i < path.length - 1; i++) {
            if (path[i].timestamp <= targetTime && path[i + 1].timestamp >= targetTime) {
              point1 = path[i];
              point2 = path[i + 1];
              break;
            }
          }
          
          // If target time is before the path, use the oldest point
          if (targetTime < path[0].timestamp) {
            point1 = path[0];
            point2 = path[0];
          }
          
          // If target time is after the path, use the newest point
          if (targetTime > path[path.length - 1].timestamp) {
            point1 = path[path.length - 1];
            point2 = path[path.length - 1];
          }
          
          // Interpolate between the two points
          let interpolatedX = point1.x;
          let interpolatedY = point1.y;
          
          if (point1.timestamp !== point2.timestamp) {
            const t = (targetTime - point1.timestamp) / (point2.timestamp - point1.timestamp);
            interpolatedX = point1.x + (point2.x - point1.x) * t;
            interpolatedY = point1.y + (point2.y - point1.y) * t;
          }
          
          // Smoothly update sparkle position
          sparkle.x.set(interpolatedX);
          sparkle.y.set(interpolatedY);
        });
      } else {
        // If path is too short, just use current position
        sparkles.forEach((sparkle) => {
          sparkle.x.set(x);
          sparkle.y.set(y);
        });
      }
    },
    [cursorX, cursorY, isVisible, particles, isHovering, sparkles, checkIfInModal]
  );

  // Mouse enter handler for interactive elements
  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target;

    // Check if target is an HTMLElement
    if (!target || !(target instanceof HTMLElement)) {
      return;
    }

    // Check if we're in a modal - if so, always show cursor
    const inModal = checkIfInModal(e.clientX, e.clientY);
    if (inModal) {
      setIsVisible(true);
    }

    const isInteractive =
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.hasAttribute("href") ||
      (target.hasAttribute("role") && target.getAttribute("role") === "button") ||
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.tagName === "SELECT" ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='button']") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.style.cursor === "pointer" ||
      window.getComputedStyle(target).cursor === "pointer" ||
      inModal; // Always treat modal areas as interactive for cursor visibility

    if (isInteractive) {
      setIsHovering(true);
      hoveredElementRef.current = target;
    }
  }, [checkIfInModal]);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    hoveredElementRef.current = null;
  }, []);

  // Mouse down handler
  const handleMouseDown = useCallback(() => {
    setIsClicking(true);
  }, []);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsClicking(false);
  }, []);

  // Mouse leave window handler
  const handleMouseLeaveWindow = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Mouse enter window handler
  const handleMouseEnterWindow = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Set up event listeners
  useEffect(() => {
    // Only set up listeners if not touch device and not reduced motion
    if (isTouchDevice || isReducedMotion) {
      return;
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter, true);
    document.addEventListener("mouseleave", handleMouseLeave, true);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter, true);
      document.removeEventListener("mouseleave", handleMouseLeave, true);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
    };
  }, [
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeaveWindow,
    handleMouseEnterWindow,
    isTouchDevice,
    isReducedMotion,
  ]);

  // Don't render cursor on touch devices or if reduced motion is preferred
  // This check happens AFTER all hooks are called
  // Always show cursor when in modal, even if not visible yet
  if (isTouchDevice || isReducedMotion || (!isVisible && !isInModal)) {
    return null;
  }

  // Calculate cursor size and color based on state
  const cursorSize = isHovering ? 32 : 12;
  const cursorBorderWidth = isHovering ? 2 : 1.5;
  const particleSize = 4;
  const lightBlue = "#87CEEB"; // Sky blue color
  const lightBlueGlow = "#B0E0E6"; // Powder blue for glow

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          left: -cursorSize / 2,
          top: -cursorSize / 2,
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: isClicking || isHovering ? 0.7 : 1,
        }}
        transition={{
          scale: { type: "spring", stiffness: 400, damping: 25 },
          opacity: { duration: 0.2 },
        }}
      >
        <div
          className="rounded-full border-2"
          style={{
            width: cursorSize,
            height: cursorSize,
            borderWidth: cursorBorderWidth,
            borderColor: lightBlue,
            backgroundColor: isHovering ? lightBlue : "transparent",
            boxShadow: isHovering
              ? `0 0 20px ${lightBlue}, 0 0 40px ${lightBlueGlow}, 0 0 60px ${lightBlue}`
              : `0 0 10px ${lightBlue}`,
          }}
        />
      </motion.div>

      {/* Trailing particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="fixed pointer-events-none z-[9998]"
          style={{
            x: particle.xSpring,
            y: particle.ySpring,
            left: -particleSize / 2,
            top: -particleSize / 2,
          }}
          animate={{
            opacity: 0.3 - index * 0.05,
          }}
          transition={{
            opacity: { duration: 0.2 },
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: particleSize,
              height: particleSize,
              backgroundColor: lightBlue,
              opacity: 0.4 - index * 0.08,
              boxShadow: `0 0 8px ${lightBlue}`,
            }}
          />
        </motion.div>
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle, index) => (
        <motion.div
          key={`sparkle-${index}`}
          className="fixed pointer-events-none z-[9997]"
          style={{
            x: sparkle.xSpring,
            y: sparkle.ySpring,
            left: -2,
            top: -2,
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <div
            style={{
              width: 4,
              height: 4,
              background: `radial-gradient(circle, ${lightBlueGlow} 0%, ${lightBlue} 50%, transparent 100%)`,
              borderRadius: "50%",
              boxShadow: `0 0 6px ${lightBlue}, 0 0 3px ${lightBlueGlow}`,
              position: "relative",
            }}
          >
            {/* Cross sparkle effect */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 1,
                height: 6,
                background: lightBlue,
                borderRadius: 0.5,
                boxShadow: `0 0 2px ${lightBlue}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(90deg)",
                width: 1,
                height: 6,
                background: lightBlue,
                borderRadius: 0.5,
                boxShadow: `0 0 2px ${lightBlue}`,
              }}
            />
          </div>
        </motion.div>
      ))}
    </>
  );
}
