import { XCircle } from 'lucide-react';

export function Modal({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-100 px-7 py-5">
                    <h2 className="text-base font-semibold text-stone-900">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 transition-colors hover:text-stone-600"
                    >
                        <XCircle className="h-5 w-5" />
                    </button>
                </div>
                <div className="px-7 py-6">{children}</div>
            </div>
        </div>
    );
}
