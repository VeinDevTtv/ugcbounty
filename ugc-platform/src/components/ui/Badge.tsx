import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "error" }) => {
    const styles = {
        default: "bg-[#341B11] text-[#F7F1E8]",
        success: "bg-[#341B11] text-[#F7F1E8] border border-[#C47A53]/30",
        warning: "bg-amber-900/30 text-amber-300",
        error: "bg-red-900/30 text-red-400",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", styles[variant])}>
            {children}
        </span>
    );
};
