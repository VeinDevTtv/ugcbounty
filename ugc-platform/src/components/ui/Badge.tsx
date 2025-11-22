import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "error" }) => {
    const styles = {
        default: "bg-[#DDE5F2] text-[#2E3A47]",
        success: "bg-green-50 text-green-700 border border-green-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        error: "bg-red-50 text-red-600 border border-red-200",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", styles[variant])}>
            {children}
        </span>
    );
};
