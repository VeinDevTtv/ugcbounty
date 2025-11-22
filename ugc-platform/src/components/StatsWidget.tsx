import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-xl border border-[#3A2518] bg-[#25160F] p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#CBB8A4]">{label}</p>
                <Icon className="h-5 w-5 text-[#CBB8A4]" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-[#F7F1E8]">{value}</h3>
                {trend && <span className="text-xs text-[#C47A53] mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
