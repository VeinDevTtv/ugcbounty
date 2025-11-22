import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-xl border border-[#1F2937] bg-[#111827] p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#9CA3AF]">{label}</p>
                <Icon className="h-5 w-5 text-[#9CA3AF]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-[#F9FAFB]">{value}</h3>
                {trend && <span className="text-xs text-[#10B981] mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
