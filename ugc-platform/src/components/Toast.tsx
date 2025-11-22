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
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl animate-in slide-in-from-bottom-5 dark:bg-[#141B23] dark:border-[#1A2332] dark:text-[#F5F8FC] bg-white border-[#C8D1E0] text-[#2E3A47]">
            <CheckCircle className="h-5 w-5 dark:text-[#60A5FA] text-[#4F6FA8]" />
            <span>{message}</span>
        </div>
    );
}
