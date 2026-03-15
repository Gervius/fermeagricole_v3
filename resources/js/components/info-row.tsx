export function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="min-w-[80px] text-xs text-stone-500">
                {label} :
            </span>
            <span className="text-sm font-medium text-stone-900">{value}</span>
        </div>
    );
}
