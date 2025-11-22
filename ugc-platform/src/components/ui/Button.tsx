import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-[#E7D0B0] text-[#3B2415] hover:bg-[#D4BA96] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7F1E8]",
        secondary: "bg-[#3A2518] text-[#F7F1E8] hover:bg-[#4A3528]",
        outline: "border border-[#3A2518] bg-transparent hover:bg-[#25160F] text-[#F7F1E8]",
        ghost: "bg-transparent hover:bg-[#25160F] text-[#CBB8A4]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:bg-[#3A2518] disabled:text-[#8F7A65]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
