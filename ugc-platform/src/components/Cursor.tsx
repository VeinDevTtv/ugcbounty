"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MousePosition {
  x: number;
  y: number;
}

type CursorState = "default" | "hover" | "click";

const PARTICLE_COUNT = 4;

export default function Cursor() {
  const [cursorState, setCursorState] = useState<CursorState>("default");
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

  // Trailing particles positions - create motion values at top level
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: useMotionValue(0),
    y: useMotionValue(0),
    delay: (i + 1) * 0.05,
  }));

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

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
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
    window.addEventListener("resize", checkTouchDevice);
    return () => window.removeEventListener("resize", checkTouchDevice);
  }, []);

  // Don't render cursor on touch devices or if reduced motion is preferred
  if (isTouchDevice || isReducedMotion) {
    return null;
  }

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
    },
    [cursorX, cursorY, isVisible, particles, isHovering]
  );

  // Mouse enter handler for interactive elements
  const handleMouseEnter = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive =
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.hasAttribute("href") ||
      target.hasAttribute("role") && target.getAttribute("role") === "button" ||
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
      setCursorState("hover");
      hoveredElementRef.current = target;
    }
  }, []);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCursorState("default");
    hoveredElementRef.current = null;
  }, []);

  // Mouse down handler
  const handleMouseDown = useCallback(() => {
    setIsClicking(true);
    setCursorState("click");
  }, []);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsClicking(false);
    setCursorState(isHovering ? "hover" : "default");
  }, [isHovering]);

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
  ]);

  // Calculate cursor size and color based on state
  const cursorSize = isHovering ? 32 : 12;
  const cursorBorderWidth = isHovering ? 2 : 1.5;
  const particleSize = 4;

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          left: -cursorSize / 2,
          top: -cursorSize / 2,
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0,
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
            borderColor: "var(--color-accent)",
            backgroundColor: isHovering ? "var(--color-accent)" : "transparent",
            boxShadow: isHovering
              ? "0 0 20px var(--color-accent), 0 0 40px var(--color-accent)"
              : "none",
          }}
        />
      </motion.div>

      {/* Trailing particles */}
      {particles.map((particle, index) => {
        const particleXSpring = useSpring(particle.x, {
          damping: 20,
          stiffness: 200,
          mass: 0.3,
        });
        const particleYSpring = useSpring(particle.y, {
          damping: 20,
          stiffness: 200,
          mass: 0.3,
        });

        return (
          <motion.div
            key={index}
            className="fixed pointer-events-none z-[9998] mix-blend-difference"
            style={{
              x: particleXSpring,
              y: particleYSpring,
              left: -particleSize / 2,
              top: -particleSize / 2,
            }}
            animate={{
              opacity: isVisible ? 0.3 - index * 0.05 : 0,
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
                backgroundColor: "var(--color-accent)",
                opacity: 0.4 - index * 0.08,
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
}

