import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface Flock {
    id: number;
    name: string;
    building: string;
    initial_quantity: number;
    creator: string;
}

interface Props {
    flock: Flock | null;
    onClose: () => void;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
}

export default function DailyRecordApprovalModal({
    flock,
    onClose,
    onApprove,
    onReject,
}: Props) {
    const [rejectionReason, setRejectionReason] = useState('');

    if (!flock) return null;

    const handleReject = () => {
        if (rejectionReason.trim()) {
            onReject(flock.id, rejectionReason);
        }
    };

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                    Approbation de génération
                </h2>
                <div className="mb-6 space-y-4">
                    <div>
                        <span className="text-sm text-gray-600">
                            Génération:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                            {flock.name}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Bâtiment:</span>
                        <span className="ml-2 text-gray-900">
                            {flock.building}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">
                            Effectif initial:
                        </span>
                        <span className="ml-2 text-gray-900">
                            {flock.initial_quantity.toLocaleString()}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">
                            Créée par:
                        </span>
                        <span className="ml-2 text-gray-900">
                            {flock.creator}
                        </span>
                    </div>
                </div>
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Raison du rejet (si rejeté)
                    </label>
                    <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                        rows={3}
                        placeholder="Entrez la raison du rejet..."
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <XCircle className="h-4 w-4" />
                        Rejeter
                    </button>
                    <button
                        onClick={() => onApprove(flock.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Approuver
                    </button>
                </div>
            </div>
        </div>
    );
}
