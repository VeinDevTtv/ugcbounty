import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-2xl border border-[#010A12] bg-[#020617] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.6)]">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#CFCFCF]">{label}</p>
                <Icon className="h-5 w-5 text-[#CFCFCF]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-[#FFFFFF]">{value}</h3>
                {trend && <span className="text-xs text-[#10B981] mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
