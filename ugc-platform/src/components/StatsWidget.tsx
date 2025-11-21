import { LucideIcon } from "lucide-react";

interface Props {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
}

export default function StatsWidget({ label, value, icon: Icon, trend }: Props) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <Icon className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
                {trend && <span className="text-xs text-emerald-600 mb-1 font-medium">{trend}</span>}
            </div>
        </div>
    );
}
