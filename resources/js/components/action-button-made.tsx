export function ActionButton({
    icon,
    title,
    colorClass,
    onClick,
}: {
    icon: React.ReactNode;
    title: string;
    colorClass: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`rounded-lg p-1.5 text-stone-400 transition-colors ${colorClass}`}
        >
            {icon}
        </button>
    );
}
