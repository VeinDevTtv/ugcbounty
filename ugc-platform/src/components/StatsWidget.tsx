import { LucideIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    bgColorLight?: string;
    bgColorDark?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend, bgColorLight, bgColorDark }: Props) {
    const { theme } = useTheme();
    const hasCustomColors = bgColorLight || bgColorDark;
    const defaultBgClass = theme === "light" ? "bg-white" : "bg-[#141B23]";
    
    return (
        <div 
            className={`rounded-2xl border p-6 dark:border-[#1A2332] dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)] border-[#C8D1E0] ${hasCustomColors ? "" : defaultBgClass}`}
            style={hasCustomColors ? {
                backgroundColor: theme === "light" ? bgColorLight : bgColorDark
            } : undefined}
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium dark:text-[#B8C5D6] text-[#52677C]">{label}</p>
                <Icon className="h-5 w-5 dark:text-[#B8C5D6] text-[#52677C]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold dark:text-[#F5F8FC] text-[#2E3A47]">{value}</h3>
                {trend && <span className="text-xs mb-1 font-medium dark:text-[#60A5FA] text-[#4F6FA8]">{trend}</span>}
            </div>
        </div>
    );
}
