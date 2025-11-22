import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-2xl border p-6 dark:border-[#010A12] dark:bg-[#020617] dark:shadow-[0_12px_30px_rgba(15,23,42,0.6)] border-[#C8D1E0] bg-white">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium dark:text-[#CFCFCF] text-[#52677C]">{label}</p>
                <Icon className="h-5 w-5 dark:text-[#CFCFCF] text-[#52677C]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold dark:text-[#FFFFFF] text-[#2E3A47]">{value}</h3>
                {trend && <span className="text-xs mb-1 font-medium dark:text-[#10B981] text-[#4F6FA8]">{trend}</span>}
            </div>
        </div>
    );
}
