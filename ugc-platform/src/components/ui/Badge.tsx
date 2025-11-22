import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "error" }) => {
    const styles = {
        default: "bg-[rgba(16,185,129,0.12)] text-[#FFFFFF] border border-[#10B981]",
        success: "bg-[rgba(16,185,129,0.12)] text-[#FFFFFF] border border-[#10B981]",
        warning: "bg-amber-900/30 text-amber-300 border border-amber-500/30",
        error: "bg-red-900/30 text-red-400 border border-red-500/30",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", styles[variant])}>
            {children}
        </span>
    );
};
