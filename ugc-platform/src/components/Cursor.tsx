"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const magneticOffsetRef = useRef({ x: 0, y: 0 });

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

  // Sparkle particles - create motion values for sparkles
  const sparkle1X = useMotionValue(0);
  const sparkle1Y = useMotionValue(0);
  const sparkle2X = useMotionValue(0);
  const sparkle2Y = useMotionValue(0);
  const sparkle3X = useMotionValue(0);
  const sparkle3Y = useMotionValue(0);
  const sparkle4X = useMotionValue(0);
  const sparkle4Y = useMotionValue(0);
  const sparkle5X = useMotionValue(0);
  const sparkle5Y = useMotionValue(0);
  const sparkle6X = useMotionValue(0);
  const sparkle6Y = useMotionValue(0);

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

  // Sparkles array - memoized
  const sparkles = useMemo(
    () => [
      { x: sparkle1X, y: sparkle1Y, angle: 0, delay: 0 },
      { x: sparkle2X, y: sparkle2Y, angle: 60, delay: 0.2 },
      { x: sparkle3X, y: sparkle3Y, angle: 120, delay: 0.4 },
      { x: sparkle4X, y: sparkle4Y, angle: 180, delay: 0.6 },
      { x: sparkle5X, y: sparkle5Y, angle: 240, delay: 0.8 },
      { x: sparkle6X, y: sparkle6Y, angle: 300, delay: 1.0 },
    ],
    [sparkle1X, sparkle1Y, sparkle2X, sparkle2Y, sparkle3X, sparkle3Y, sparkle4X, sparkle4Y, sparkle5X, sparkle5Y, sparkle6X, sparkle6Y]
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

  // Mouse move handler with throttling
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

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

      // Update trailing particles with delay
      particles.forEach((particle, index) => {
        setTimeout(() => {
          particle.x.set(x);
          particle.y.set(y);
        }, index * 10);
      });

      // Update sparkles in a circular pattern around cursor
      const sparkleRadius = 20;
      sparkles.forEach((sparkle) => {
        const angle = (sparkle.angle + Date.now() * 0.001) % 360;
        const radian = (angle * Math.PI) / 180;
        const offsetX = Math.cos(radian) * sparkleRadius;
        const offsetY = Math.sin(radian) * sparkleRadius;
        sparkle.x.set(x + offsetX);
        sparkle.y.set(y + offsetY);
      });
    },
    [cursorX, cursorY, isVisible, particles, isHovering, sparkles]
  );

  // Mouse enter handler for interactive elements
  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target;

    // Check if target is an HTMLElement
    if (!target || !(target instanceof HTMLElement)) {
      return;
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
      window.getComputedStyle(target).cursor === "pointer";

    if (isInteractive) {
      setIsHovering(true);
      hoveredElementRef.current = target;
    }
  }, []);

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
  if (isTouchDevice || isReducedMotion || !isVisible) {
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
            x: sparkle.x,
            y: sparkle.y,
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
