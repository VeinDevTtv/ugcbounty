import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-xl border border-[#C8D1E0] bg-white p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#52677C]">{label}</p>
                <Icon className="h-5 w-5 text-[#52677C]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-[#2E3A47]">{value}</h3>
                {trend && <span className="text-xs text-[#4F6FA8] mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
