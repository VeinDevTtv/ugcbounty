"use client";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

// A simple toast component that renders if a "show" prop is true
export default function Toast({ message, show, onClose }: { message: string, show: boolean, onClose: () => void }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-lg bg-[#25160F] border border-[#3A2518] px-4 py-3 text-[#F7F1E8] shadow-xl animate-in slide-in-from-bottom-5">
            <CheckCircle className="h-5 w-5 text-[#C47A53]" />
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}
