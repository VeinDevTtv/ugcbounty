"use client";

import dynamic from "next/dynamic";

// Dynamically import Cursor component to avoid SSR issues
const Cursor = dynamic(() => import("@/components/Cursor"), {
  ssr: false,
});

export default function CursorWrapper() {
  return <Cursor />;
}

