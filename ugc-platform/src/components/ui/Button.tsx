import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-[#10B981] text-[#FFFFFF] hover:bg-[#059669] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/50 font-semibold",
        secondary: "bg-[#1F2937] text-[#FFFFFF] hover:bg-[#2A3441]",
        outline: "border border-[#1F2937] bg-transparent hover:bg-[#020617] text-[#FFFFFF]",
        ghost: "bg-transparent hover:bg-[#020617] text-[#CFCFCF]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:bg-[#1F2937] disabled:text-[#6B7280]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
