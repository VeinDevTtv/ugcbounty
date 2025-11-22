"use client";
import { X } from "lucide-react";
import { Button } from "./ui/Button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-[#020617] shadow-2xl animate-in fade-in zoom-in duration-200 border border-[#010A12]">
                <div className="flex items-center justify-between border-b border-[#010A12] p-4">
                    <h2 className="text-lg font-semibold text-[#FFFFFF]">{title}</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
