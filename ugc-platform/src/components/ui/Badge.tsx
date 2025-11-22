import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "error" }) => {
    const styles = {
        default: "bg-[rgba(34,197,94,0.12)] text-[#F9FAFB] border border-[#22C55E]",
        success: "bg-[rgba(34,197,94,0.12)] text-[#F9FAFB] border border-[#22C55E]",
        warning: "bg-amber-900/30 text-amber-300 border border-amber-500/30",
        error: "bg-red-900/30 text-red-400 border border-red-500/30",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", styles[variant])}>
            {children}
        </span>
    );
};
