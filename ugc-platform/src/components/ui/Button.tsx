import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-[#0F9D58] text-white hover:bg-[#0C7A44] shadow-sm",
        secondary: "bg-[#2F3A2E] text-white hover:bg-[#1F2A1E]",
        outline: "border border-[#E4D5C2] bg-transparent hover:bg-[#FFF8EC] text-[#2F3A2E]",
        ghost: "bg-transparent hover:bg-[#FFF8EC] text-[#6B6A5E]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F9D58]/20 disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
