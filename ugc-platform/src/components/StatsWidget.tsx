import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-xl border border-[#E4D5C2] bg-[#FFF8EC] p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#6B6A5E]">{label}</p>
                <Icon className="h-5 w-5 text-[#6B6A5E]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-[#2F3A2E]">{value}</h3>
                {trend && <span className="text-xs text-[#0F9D58] mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
