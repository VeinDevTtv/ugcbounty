import { cn } from "@/lib/utils";

export const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "error" }) => {
    const styles = {
        default: "dark:bg-[rgba(96,165,250,0.12)] dark:text-[#F5F8FC] dark:border-[#60A5FA] bg-[#DDE5F2] text-[#2E3A47] border",
        success: "dark:bg-[rgba(96,165,250,0.12)] dark:text-[#F5F8FC] dark:border-[#60A5FA] bg-green-50 text-green-700 border-green-200",
        warning: "dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-500/30 bg-amber-50 text-amber-700 border-amber-200",
        error: "dark:bg-red-900/30 dark:text-red-400 dark:border-red-500/30 bg-red-50 text-red-600 border-red-200",
    };
    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", styles[variant])}>
            {children}
        </span>
    );
};
