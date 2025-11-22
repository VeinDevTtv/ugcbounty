import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-[#7A8CB3] text-white hover:bg-[#6A7AA0] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20",
        secondary: "bg-[#1B3C73] text-white hover:bg-[#102B52]",
        outline: "border border-[#C8D1E0] bg-transparent hover:bg-[#DDE5F2] text-[#2E3A47]",
        ghost: "bg-transparent hover:bg-[#DDE5F2] text-[#52677C]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:bg-[#D9E1EF] disabled:text-[#8B9BB0]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
