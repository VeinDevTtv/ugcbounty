import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export const Button = ({ className, variant = "primary", size = "md", ...props }: ButtonProps) => {
    const variants = {
        primary: "dark:bg-[#60A5FA] dark:text-[#FFFFFF] dark:hover:bg-[#3B82F6] dark:focus:ring-[#60A5FA]/50 bg-[#7A8CB3] text-white hover:bg-[#6A7AA0] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7A8CB3]/20 font-semibold",
        secondary: "dark:bg-[#141B23] dark:text-[#F5F8FC] dark:hover:bg-[#1F2937] bg-[#1B3C73] text-white hover:bg-[#102B52]",
        outline: "dark:border-[#1A2332] dark:bg-transparent dark:hover:bg-[#0A0F17] dark:text-[#F5F8FC] border-[#C8D1E0] bg-transparent hover:bg-[#DDE5F2] text-[#2E3A47]",
        ghost: "dark:bg-transparent dark:hover:bg-[#0A0F17] dark:text-[#B8C5D6] bg-transparent hover:bg-[#DDE5F2] text-[#52677C]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 dark:disabled:bg-[#1A2332] dark:disabled:text-[#64748B] disabled:bg-[#D9E1EF] disabled:text-[#8B9BB0]",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
